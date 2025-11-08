import bcrypt from "bcrypt";
import db from "../db.js";
import { constants } from "../../config/constants.js";

// ✅ Update Name
export const updateName = async (req, res) => {
  const { first_name, last_name, user_id } = req.body;
  if (!first_name || !last_name || !user_id) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "First name, last name and userid are required" });
  }

  const updateQuery = "UPDATE user SET first_name=?, last_name=? WHERE id=?;";
  try {
    const [result] = await db.query(updateQuery, [
      first_name,
      last_name,
      user_id,
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User with this id does not exist" });
    }
    res.send({
      first_name,
      last_name,
      message: "Name update successful",
    });
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ✅ Update Email
export const updateEmail = async (req, res) => {
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
    res.send({ email, message: "Email update successful" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "Email already taken" });
    }
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};

// ✅ Update Password
export const updatePassword = async (req, res) => {
  const { old_password, new_password, user_id } = req.body;
  if (!old_password || !new_password || !user_id) {
    return res
      .status(constants.HTTP_STATUS.BAD_REQUEST)
      .send({ message: "Both old and new password and userid required" });
  }

  const getOldPasswordQuery = "SELECT password FROM user WHERE id=?;";
  try {
    const [result] = await db.query(getOldPasswordQuery, [user_id]);
    if (result.length === 0) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "User with this id does not exist" });
    }

    const oldFetched = result[0].password;
    const isMatch = await bcrypt.compare(old_password, oldFetched);
    if (isMatch) {
      const newPasswordHash = await bcrypt.hash(new_password, 10);
      const updateQuery = "UPDATE user SET password=? WHERE id=?;";
      await db.query(updateQuery, [newPasswordHash, user_id]);
      return res.send({ message: "Password update successful" });
    } else {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .send({ message: "Your old password does not match" });
    }
  } catch (error) {
    return res
      .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ error, message: "Internal Server Error" });
  }
};
