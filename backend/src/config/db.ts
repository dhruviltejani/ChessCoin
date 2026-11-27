import pg from "../../node_modules/@types/pg/index.js";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL?.trim();
const isLocalConnection =
  !connectionString || /localhost|127\.0\.0\.1/.test(connectionString);

export const pool = new Pool(
  connectionString
    ? {
      connectionString,
      ssl: isLocalConnection ? undefined : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
    : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "chesscoin_dev",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
);

pool.on("connect", () => {
  const targetDb = connectionString
    ? "DATABASE_URL"
    : process.env.DB_NAME || "chesscoin_dev";
  console.log("Connected to PostgreSQL database:", targetDb);
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};
