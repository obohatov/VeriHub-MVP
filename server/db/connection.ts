import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DB_MODE = process.env.DB_MODE || "sqlite";

const sqlite = new Database("./data/verihub.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
export { DB_MODE };

console.log("[db] Connected to SQLite at ./data/verihub.db");
