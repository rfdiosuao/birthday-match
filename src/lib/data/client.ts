import "server-only";
import postgres from "postgres";
import { AppRepository } from "./repository";

type DatabaseClient = ReturnType<typeof postgres>;
type DatabaseGlobals = typeof globalThis & {
  birthdayDatabase?: DatabaseClient;
  birthdayRepository?: AppRepository;
};

const databaseGlobals = globalThis as DatabaseGlobals;

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL 尚未配置。");

  if (!databaseGlobals.birthdayDatabase) {
    databaseGlobals.birthdayDatabase = postgres(databaseUrl, {
      connect_timeout: 10,
      idle_timeout: 20,
      max: 5,
      max_lifetime: 60 * 30,
    });
  }

  return databaseGlobals.birthdayDatabase;
}

export function getRepository() {
  if (!databaseGlobals.birthdayRepository) {
    databaseGlobals.birthdayRepository = new AppRepository(getDatabase());
  }
  return databaseGlobals.birthdayRepository;
}
