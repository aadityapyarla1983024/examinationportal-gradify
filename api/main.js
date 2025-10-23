import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import auth from "./routes/auth.js";
import cors from "cors";
import config from "config";
import profile from "./routes/profile.js";

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use(
  cors({
    origin: "http://localhost:5184",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ["x-auth-token"],
  })
);
app.use("/api/auth", auth);
app.use("/api/profile", profile);

const PORT = config.get("server.port");
const HOST = config.get("server.host");

app.listen(PORT, HOST, (err) => {
  if (err) {
    console.log(`Something went wrong in listening at ${HOST}:${PORT}`);
    console.log(err);
  }
  console.log(`Listening on ${HOST}:${PORT}`);
});
