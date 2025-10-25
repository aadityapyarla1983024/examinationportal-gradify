import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import auth from "./routes/auth.js";
import cors from "cors";
import config from "../config/dev.js";
import profile from "./routes/profile.js";
import { constants } from "../config/constants.js";
import https from "https"; // Missing import
import http from "http"; // Missing import
import fs from "fs"; // Missing import

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use(
  cors({
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

const startServer = () => {
  try {
    if (fs.existsSync(config.server.api.ssl.key) && fs.existsSync(config.server.api.ssl.cert)) {
      const sslOptions = {
        key: fs.readFileSync("./localhost+3-key.pem"),
        cert: fs.readFileSync("./localhost+3.pem"),
      };

      https.createServer(sslOptions, app).listen(PORT, HOST, () => {
        console.log(`Backend running on https://${HOST}:${PORT}`);
      });
    } else {
      throw new Error("SSL certificates not found");
    }
  } catch (error) {
    console.log("SSL certificates not found, falling back to HTTP");

    http.createServer(app).listen(PORT, HOST, () => {
      console.log(`Backend running on http://${HOST}:${PORT}`);
    });
  }
};

startServer();
