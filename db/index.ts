import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Next.js already loads .env.local itself; this is a no-op there since it
// won't override existing vars. It's only load-bearing for standalone
// scripts (seed, drizzle-kit) run directly through tsx/node.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
