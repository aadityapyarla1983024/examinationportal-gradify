import express from "express";
import bcrypt from "bcrypt";
import db from "../db.js";
import { constants } from "../../config/constants.js";

const app = express();
const profile = app.use(express.Router());

profile.post("/nameupdate", (req, res) => {
  console.log(req);
  const { first_name, last_name, user_id } = req.body;
  if (!first_name || !last_name || !user_id) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "First name,last name and userid is required" });
  }
  const updateQuery = "UPDATE user SET first_name=?, last_name=? WHERE id=?;";
  db.query(updateQuery, [first_name, last_name, user_id], (error, result) => {
    if (error) {
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Database error" });
    }
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
  });
});

profile.post("/emailupdate", (req, res) => {
  const { email, user_id } = req.body;
  if (!email || !user_id) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Email and userid required" });
  }
  const updateQuery = "UPDATE user SET email=? WHERE id=?;";

  db.query(updateQuery, [email, user_id], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(constants.HTTP_STATUS.BAD_REQUEST)
          .send({ message: "Email already taken" });
      }
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User with this id does not exist" });
    }
    res.send({ email, message: "Email update successfull" });
  });
});

profile.post("/passwordupdate", async (req, res) => {
  const { old_password, new_password, user_id } = req.body;
  if (!old_password || !new_password || !user_id)
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Both old and new password and userid required" });
  const getOldPasswordQuery = "SELECT password FROM user WHERE id=?;";
  db.query(getOldPasswordQuery, [user_id], async (error, result) => {
    if (error)
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Database error during password fetch" });
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
      db.query(updateQuery, [newPaswordHash, user_id], (error, result) => {
        if (error)
          return res
            .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .send({ error, message: "Database error during password update" });
        res.send({ message: "Password update successfull" });
      });
    } else {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "Your old password does not match" });
    }
  });
});

export default profile;
