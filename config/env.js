import { z } from "zod";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

// Helper function to safely get a local IPv4 address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

// Environment schema with validation and defaults
const envSchema = z.object({
  // === Server Config ===
  API_SERVER_HOST: z.string().default(getLocalIp()),
  API_SERVER_PORT: z.string().transform(Number).default("3000"),
  FRONT_SERVER_HOST: z.string().default(getLocalIp()),
  FRONT_SERVER_PORT: z.string().transform(Number).default("5173"),
  SSL_CERT_PATH: z.string().default(""),
  SSL_KEY_PATH: z.string().default(""),

  // === Database ===
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.string().transform(Number).default("3306"),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_DATABASE: z.string().default("gradify"),

  // === JWT ===
  JWT_PRIVATE_KEY: z.string().min(1, "JWT private key is required"),

  // === Mail ===
  MAIL_USER: z.string().email(),
  MAIL_PASS: z.string().min(1),
});

// Export parsed environment variables
export const env = envSchema.parse(process.env);
