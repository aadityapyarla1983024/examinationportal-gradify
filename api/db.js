import { createPool } from "mysql2";
import config from "../config/dev.js";

const db = createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
}).promise();

export default db;
