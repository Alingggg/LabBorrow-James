import { drizzle } from "drizzle-orm/node-postgres";
import { appRelations } from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

export const db = drizzle(databaseUrl, {
  relations: appRelations,
});
