import jwt from "jsonwebtoken";
import config from "../../config/dev.js";
import { constants } from "../../config/constants.js";

export default function verfiyToken(req, res, next) {
  const token = req.headers["x-auth-token"];
  if (!token)
    return res
      .status(constants.HTTP_STATUS.UNAUTHORIZED)
      .send({ message: "Access Denied. No token provided." });
  try {
    const decoded = jwt.verify(token, config.jwt.privateKey);
    req.user_id = decoded.id;
    console.log(decoded.id);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).send({
        message: "Token expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).send({
        message: "Invalid token",
      });
    } else {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).send({
        message: "Authentication failed",
      });
    }
  }
}
