import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import fs from "fs";
import https from "https";
import http from "http";
import config from "../config/dev.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === ROUTES ===
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import examRoutes from "./routes/exam.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import myexamsRoutes from "./routes/myexams.routes.js";
import examinfoRoutes from "./routes/examinfo.routes.js";
import pubRoutes from "./routes/publicexam.routes.js";
import evaluateRoutes from "./routes/evaluate.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import upload from "./routes/upload.routes.js";

const app = express();

// === GLOBAL MIDDLEWARE ===
app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ["x-auth-token"],
  })
);

// === ROUTE REGISTRATION ===
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/attempt", attemptRoutes);
app.use("/api/myexams", myexamsRoutes);
app.use("/api/examinfo", examinfoRoutes);
app.use("/api/public-exam", pubRoutes);
app.use("/api/evaluate", evaluateRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/upload", upload);
app.use("/images", express.static(path.join(__dirname, "public/images")));

// === SERVER CONFIG ===
const { port: PORT, host: HOST, ssl } = config.server.api;

const startServer = () => {
  try {
    if (fs.existsSync(ssl.key) && fs.existsSync(ssl.cert)) {
      const sslOptions = { key: ssl.key, cert: ssl.cert };
      https.createServer(sslOptions, app).listen(PORT, HOST, () => {
        console.log(`✅ Backend running securely on https://${HOST}:${PORT}`);
      });
    } else {
      throw new Error("SSL certificates not found");
    }
  } catch (error) {
    console.log("⚠️ SSL not found, falling back to HTTP...");
    http.createServer(app).listen(PORT, HOST, () => {
      console.log(`✅ Backend running on http://${HOST}:${PORT}`);
    });
  }
};

startServer();
