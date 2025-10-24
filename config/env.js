import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
import os from "os";

const envSchema = z.object({
  // Server
  API_SERVER_HOST: z.string().default(os.networkInterfaces()["wlan0"][0].address),
  API_SERVER_PORT: z.string().transform(Number).default("3000"),
  FRONT_SERVER_HOST: z.string().default(os.networkInterfaces()["wlan0"][0].address),
  FRONT_SERVER_PORT: z.string().transform(Number).default("5173"),

  // Database
  DB_HOST: z.string().default("127.0.0.1"),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_DATABASE: z.string().default("gradify"),

  // JWT
  JWT_PRIVATE_KEY: z.string().min(1, "JWT private key is required"),

  // Mail
  MAIL_USER: z.email(),
  MAIL_PASS: z.string().min(1),
});

export const env = envSchema.parse(process.env);
