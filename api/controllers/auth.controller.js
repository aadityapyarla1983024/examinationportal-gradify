import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import config from "../../config/dev.js";
import sendEmail from "../utilities/email/sendEmail.js";
import passwordResetTemplate from "../utilities/email/templates/passwordResetTemplate.js";
import { constants } from "../../config/constants.js";

// ---------------- SIGN UP ----------------
export const signup = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send("All fields are required");
  }

  const hashed = await hash(password, 10);
  const insertQuery =
    "INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await db.query(insertQuery, [
      first_name,
      last_name,
      email,
      hashed,
    ]);

    const token = jwt.sign(
      { id: result.insertId, email },
      config.jwt.privateKey,
      {
        expiresIn: constants.JWT.EXPIRES_IN.LOGIN,
      }
    );

    res
      .status(constants.HTTP_STATUS.CREATED)
      .header({ "x-auth-token": token })
      .send({
        user_id: result.insertId,
        first_name,
        last_name,
        email,
        message: "User signed up successfully",
      });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ error, message: "User with this email already exists" });
    }
    res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ---------------- SIGN IN ----------------
export const signin = async (req, res) => {
  const { email, password } = req.body;
  const signinquery = "SELECT * FROM user WHERE email = ?;";
  try {
    const [result] = await db.query(signinquery, [email]);
    if (result.length === 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User with this email does not exist" });
    }

    const user = result[0];
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id }, config.jwt.privateKey, {
      expiresIn: constants.JWT.EXPIRES_IN.LOGIN,
    });

    res.header("x-auth-token", token).send({
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email,
      message: "Login successful",
    });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ---------------- RESET PASSWORD ----------------
export const resetPassword = async (req, res) => {
  const { new_password } = req.body;
  const hashedPassword = await hash(new_password, 10);
  const updateQuery = "UPDATE user SET password=? WHERE id=?";
  try {
    const [result] = await db.query(updateQuery, [hashedPassword, req.user_id]);
    if (result.affectedRows === 0) {
      return res
        .status(constants.HTTP_STATUS.NOT_FOUND)
        .send({ message: "User with this ID does not exist" });
    }
    res.send({ message: "Your password was updated successfully" });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ---------------- FORGOT PASSWORD ----------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send("Email is required");

  const searchEmailQuery =
    "SELECT id, first_name, last_name FROM user WHERE email=?";
  try {
    const [result] = await db.query(searchEmailQuery, [email]);
    if (result.length === 0)
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "No user found with this email" });

    const { id, first_name, last_name } = result[0];
    const token = jwt.sign({ id }, config.jwt.privateKey, {
      expiresIn: constants.JWT.EXPIRES_IN.PASS_RESET,
    });

    const passwordResetLink = `http://${config.server.front.host}:${config.server.front.port}/reset-password/${token}`;
    const fullName = `${first_name} ${last_name}`;

    await sendEmail(email, passwordResetEmail(passwordResetLink, fullName));

    res.send({ message: "Email sent successfully" });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ---------------- LOGIN VERIFY ----------------
export const loginVerify = async (req, res) => {
  const { user_id } = req;
  const userFetchQuery = "SELECT * FROM user WHERE id=?";
  try {
    const [result] = await db.query(userFetchQuery, [user_id]);
    if (result.length === 0)
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User does not exist" });

    const { first_name, last_name, email } = result[0];
    return res.send({
      user_id,
      first_name,
      last_name,
      email,
      message: "Token valid",
    });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};
