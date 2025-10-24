import express from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import config from "../../config/dev.js";
import sendEmail from "../utilities/mailer.js";
import passwordResetEmail from "../utilities/pass_reset_format.js";
import verfiyToken from "../middleware/tokenverify.middleware.js";
import { constants } from "../../config/constants.js";

const app = express();
const auth = app.use(express.Router());

auth.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).send("All fields are required");
  }
  const hashed = await hash(password, 10);
  const insertQuery =
    "INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?); ";
  db.query(insertQuery, [first_name, last_name, email, hashed], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(constants.HTTP_STATUS.BAD_REQUEST)
          .send({ error, message: "User with this is email already exists" });
      }
      res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Database error" });
    }
    const token = jwt.sign({ id: result.insertId, email }, config.jwt.privateKey, {
      expiresIn: constants.JWT.EXPIRES_IN.LOGIN,
    });
    res.status(constants.HTTP_STATUS.CREATED).header({ "x-auth-token": token }).send({
      user_id: result.insertId,
      first_name,
      last_name,
      email,
      message: "User signed up successfully",
    });
  });
});

auth.post("/reset-password", verfiyToken, async (req, res) => {
  const { new_password } = req.body;
  const hashedPassword = await hash(new_password, 10);
  const updateQuery = "UPDATE user SET password=? WHERE id=?;";
  console.log(req.us);
  db.query(updateQuery, [hashedPassword, req.user_id], (error, result) => {
    if (error)
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Database error" });
    if (result.affectedRows === 0)
      return res
        .status(constants.HTTP_STATUS.NOT_FOUND)
        .send({ message: "User with this id does not exist" });
    res.send({ message: "Your password was updated successfully" });
  });
});

auth.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) return res.status(constants.HTTP_STATUS.BAD_REQUEST).send("Email is required");
  const searchEmailQuery = "SELECT id, first_name, last_name FROM user WHERE email=?;";
  db.query(searchEmailQuery, [email], async (error, result) => {
    if (error)
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Database error" });
    console.log(result);
    const { id, first_name, last_name } = result[0];
    const token = jwt.sign({ id }, config.jwt.privateKey, {
      expiresIn: constants.JWT.EXPIRES_IN.PASS_RESET,
    });
    const passwordResetLink = `http://${config.server.front.host}:${config.server.front.port}/reset-password/${token}`;
    const fullName = first_name + last_name;
    await sendEmail(email, passwordResetEmail(passwordResetLink, fullName)).catch(console.error);
    res.send({ message: "Email sent successfully" });
  });
});

auth.get("/login-verify", (req, res) => {
  const token = req.headers["x-auth-token"];
  if (!token)
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).send({ message: "No token was provided" });
  try {
    const decoded = jwt.verify(token, config.jwt.privateKey);
    const userFetchQuery = "SELECT * FROM user WHERE id=?;";
    db.query(userFetchQuery, [decoded.id], (error, result) => {
      if (error)
        return res
          .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .send({ error, message: "Database error while fetching user" });
      if (result.length === 0)
        return res
          .status(constants.HTTP_STATUS.BAD_REQUEST)
          .send({ message: "User does not exists" });
      const { id, first_name, last_name, email } = result[0];
      return res.send({
        user_id: id,
        first_name,
        last_name,
        email,
        message: "Token valid",
      });
    });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ error, message: "Your login has expired" });
  }
});

auth.post("/signin", (req, res) => {
  const { email, password } = req.body;
  const signinquery = "SELECT * FROM user WHERE email = ?;";
  db.query(signinquery, [email], async (error, result) => {
    if (error) {
      console.log(error);
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Database error" });
    }
    if (result.length === 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User with this email does not exists" });
    }
    const user = result[0];
    const isMatch = await compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id }, config.jwt.privateKey, {
        expiresIn: constants.JWT.EXPIRES_IN.LOGIN,
      });
      res.header("x-auth-token", token).send({
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email,
        message: "Login successfull",
      });
    } else {
      res.status(constants.HTTP_STATUS.BAD_REQUEST).send({ message: "Wrong password" });
    }
  });
});

export default auth;
