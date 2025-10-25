import express from "express";
import bcrypt from "bcrypt";
import db from "../db.js";
import { constants } from "../../config/constants.js";

const app = express();
const profile = app.use(express.Router());

profile.post("/nameupdate", async (req, res) => {
  const { first_name, last_name, user_id } = req.body;
  if (!first_name || !last_name || !user_id) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "First name,last name and userid is required" });
  }
  const updateQuery = "UPDATE user SET first_name=?, last_name=? WHERE id=?;";

  try {
    const [result] = await db.query(updateQuery, [first_name, last_name, user_id]);
    if (result.affectedRows === 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User with this id does not exist" });
    }
    res.send({
      first_name,
      last_name,
      message: "Name update successfull",
    });
  } catch (error) {
    if (error) {
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Internal Server Error" });
    }
  }
});

profile.post("/emailupdate", async (req, res) => {
  const { email, user_id } = req.body;
  if (!email || !user_id) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Email and userid required" });
  }
  const updateQuery = "UPDATE user SET email=? WHERE id=?;";

  try {
    const [result] = await db.query(updateQuery, [email, user_id]);
    if (result.affectedRows === 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User with this id does not exist" });
    }
    res.send({ email, message: "Email update successfull" });
  } catch (error) {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(constants.HTTP_STATUS.BAD_REQUEST)
          .send({ message: "Email already taken" });
      }
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Internal Server Error" });
    }
  }
});

profile.post("/passwordupdate", async (req, res) => {
  const { old_password, new_password, user_id } = req.body;
  if (!old_password || !new_password || !user_id)
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Both old and new password and userid required" });
  const getOldPasswordQuery = "SELECT password FROM user WHERE id=?;";

  try {
    const [result] = await db.query(getOldPasswordQuery, [user_id], async (error, result) => {});
    if (result.length === 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User with this id does not exists" });
    }
    const oldFetched = result[0].password;
    const isMatch = await bcrypt.compare(old_password, oldFetched);
    if (isMatch) {
      const newPaswordHash = await bcrypt.hash(new_password, 10);
      const updateQuery = "UPDATE user SET password=? WHERE id=?;";
      const [result] = await db.query(updateQuery, [newPaswordHash, user_id]);
      res.send({ message: "Password update successfull" });
    } else {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "Your old password does not match" });
    }
  } catch (error) {
    if (error)
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Internal Server Error" });
  }
});

export default profile;
