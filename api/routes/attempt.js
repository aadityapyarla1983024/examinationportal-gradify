import express from "express";
import { constants } from "../../config/constants.js";
import db from "../db.js";
import verifyToken from "../middleware/tokenverify.middleware.js";

const app = express();
const attempt = app.use(express.Router());


export default attempt;
