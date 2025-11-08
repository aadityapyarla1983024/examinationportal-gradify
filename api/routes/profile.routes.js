import express from "express";
import {
  updateName,
  updateEmail,
  updatePassword,
} from "../controllers/profile.controller.js";

const router = express.Router();

// Routes
router.post("/nameupdate", updateName);
router.post("/emailupdate", updateEmail);
router.post("/passwordupdate", updatePassword);

export default router;
