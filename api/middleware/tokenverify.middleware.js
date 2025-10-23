import jwt from "jsonwebtoken";
import config from "config";

export default function verfiyToken(req, res, next) {
  const token = req.headers["x-auth-token"];
  if (!token) return res.status(400).send({ message: "Access Denied. No token provided." });
  try {
    const decoded = jwt.verify(token, config.get("jwt.private_key"));
    req.user_id = decoded.id;
    console.log(decoded);
    next();
  } catch (error) {
    return res.status(400).send({ message: "Invalid token or token expired" });
  }
}
