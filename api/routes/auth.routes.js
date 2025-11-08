import express from "express";
import verifyToken from "../middleware/global/tokenverify.middleware.js";
import {
  signup,
  signin,
  resetPassword,
  forgotPassword,
  loginVerify,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/reset-password", verifyToken, resetPassword);
router.post("/forgot-password", forgotPassword);
router.get("/login-verify", verifyToken, loginVerify);

export default router;
