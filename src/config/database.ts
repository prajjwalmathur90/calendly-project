import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} from "./env.js";

const adapter = new PrismaMariaDb({
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
});

export const prisma = new PrismaClient({
  adapter,
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully!!");
  } catch (error) {
    console.log("Failed to connect", error);
    process.exit(1);
  }
}
