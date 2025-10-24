import { env } from "./env.js";
import { constants } from "./constants.js";
export const config = {
  server: {
    api: {
      host: env.API_SERVER_HOST,
      port: env.API_SERVER_PORT,
    },
    front: {
      host: env.FRONT_SERVER_HOST,
      port: env.FRONT_SERVER_PORT,
    },
  },
  db: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  },
  jwt: {
    privateKey: env.JWT_PRIVATE_KEY,
  },
  mail: {
    host: constants.MAIL.HOST,
    port: constants.MAIL.PORT,
    secure: constants.MAIL.SECURE,
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
};

export default config;
