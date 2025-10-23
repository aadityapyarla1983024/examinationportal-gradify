import { createConnection } from "mysql";
import config from "config";

const db = createConnection({
  host: config.get("db.host"),
  user: config.get("db.user"),
  password: config.get("db.password"),
  database: config.get("db.database"),
});

export default db;
