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

const app = express();

// === GLOBAL MIDDLEWARE ===
app.use(express.json());

// ✅ Disable HTTPS-only headers (so Chrome won’t block HTTP)
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    originAgentCluster: false,
  })
);

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));

// ✅ Allow frontend requests from anywhere (during GCP deployment)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ["x-auth-token"],
  })
);

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

// === FRONTEND SERVING ===
//const distPath = path.join(__dirname, "../dist");
//app.use(express.static(distPath));

// ✅ Fix for Express v5 “path-to-regexp” crash — use string, not regex
//app.get(/.*/, (req, res) => {
  //res.sendFile(path.join(distPath, "index.html"));
//});

// === SERVER CONFIG ===
const PORT = process.env.PORT || config.server.api.port || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ssl = config.server.api.ssl || {};

// === START SERVER ===
const startServer = () => {
  try {
    if (
      ssl.key &&
      ssl.cert &&
      fs.existsSync(ssl.key) &&
      fs.existsSync(ssl.cert)
    ) {
      const sslOptions = {
        key: fs.readFileSync(ssl.key),
        cert: fs.readFileSync(ssl.cert),
      };
      https.createServer(sslOptions, app).listen(PORT, HOST, () => {
        console.log(`✅ Backend running securely on https://${HOST}:${PORT}`);
      });
    } else {
      console.log("⚠️ SSL not found, falling back to HTTP...");
      http.createServer(app).listen(PORT, HOST, () => {
        console.log(`✅ Backend running on http://${HOST}:${PORT}`);
      });
    }
  } catch (error) {
    console.error("❌ Server startup error:", error.message);
  }
};

// 🚀 Start the server
startServer();
