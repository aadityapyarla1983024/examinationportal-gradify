import express from "express";
import verfiyToken from "../middleware/global/tokenverify.middleware.js";

const stats = express.Router();

stats.post("/get-top-10-incorrect-questions", verfiyToken, (req, res) => {});

export default stats;
