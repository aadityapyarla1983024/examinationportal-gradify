import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import auth from "./routes/auth.js";
import cors from "cors";
import config from "../config/dev.js";
import profile from "./routes/profile.js";
import { constants } from "../config/constants.js";

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use(
  cors({
    // origin: "http://localhost:5184",
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ["x-auth-token"],
  })
);
app.use("/api/auth", auth);
app.use("/api/profile", profile);

const PORT = config.server.api.port;
const HOST = config.server.api.host;
app.listen(PORT, HOST, (err) => {
  if (err) {
    console.log(`Something went wrong in listening at ${HOST}:${PORT}`);
    console.log(err);
  }
  console.log(`${constants.APP.NAME} - ${constants.APP.VERSION}`);
  console.log(constants.APP.DESCRIPTION);
  console.log(`API listening on ${HOST}:${PORT}`);
});
