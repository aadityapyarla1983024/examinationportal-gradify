import express from "express";
import db from "../db.js";
import verfiyToken from "../middleware/tokenverify.middleware.js";
import getExam from "../middleware/getexam.middleware.js";

const stats = express.Router();


stats.post("/get-top-10-incorrect-questions", verfiyToken, (req, res) => {
    
})

export default stats;