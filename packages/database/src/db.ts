import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export const db = new Pool({
  connectionString: databaseUrl,
});