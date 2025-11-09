import express from "express";
import multer from "multer";
import verifyToken from "../middleware/global/tokenverify.middleware.js";
import path from "path";
import db from "../db.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { constants } from "../../config/constants.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(
      __dirname,
      "../../public/images/upload/user/profile"
    );

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fn =
      Date.now() +
      "-" +
      String(req.user_id) +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, fn);
  },
});
const uploader = multer({ storage: storage });

upload.post(
  "/profile",
  verifyToken,
  uploader.single("profile"),
  async (req, res) => {
    console.log(req.body);
    const updateProfile = "UPDATE user SET profile=? WHERE id=?";
    try {
      const [result] = await db.query(updateProfile, [
        req.file.filename,
        req.user_id,
      ]);
      return res.send({ filename: req.file.filename });
    } catch (error) {
      return res
        .status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send({ error, message: "Internal Server Error" });
    }
  }
);

export default upload;
