import { createConnection } from "mysql";
import config from "./config/dev.js";

const db = createConnection({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

export default db;
