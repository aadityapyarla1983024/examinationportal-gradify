import jwt from "jsonwebtoken";
import config from "../../../config/dev.js";
import { constants } from "../../../config/constants.js";

/**
 * Middleware: Verify JWT Token from 'x-auth-token' header.
 * If valid → attaches user_id to request and continues.
 * If invalid or missing → responds with 401 Unauthorized.
 */
export default function verifyToken(req, res, next) {
  const token = req.headers["x-auth-token"];

  if (!token) {
    return res
      .status(constants.HTTP_STATUS.UNAUTHORIZED)
      .send({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.privateKey);
    req.user_id = decoded.id;
    return next();
  } catch (error) {
    console.error("JWT Verification Error:", error);

    if (error.name === "TokenExpiredError") {
      return res
        .status(constants.HTTP_STATUS.UNAUTHORIZED)
        .send({ message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(constants.HTTP_STATUS.UNAUTHORIZED)
        .send({ message: "Invalid token" });
    }

    return res
      .status(constants.HTTP_STATUS.UNAUTHORIZED)
      .send({ message: "Authentication failed" });
  }
}
