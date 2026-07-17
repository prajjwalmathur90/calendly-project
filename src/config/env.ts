import "dotenv/config";

export const PORT = process.env.PORT || 4000;
export const DATABASE_HOST = process.env.DATABASE_HOST!;
export const DATABASE_PORT = Number(process.env.DATABASE_PORT!);
export const DATABASE_USER = process.env.DATABASE_USER!;
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD!;
export const DATABASE_NAME = process.env.DATABASE_NAME!;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const SLOT_GENERATION_SLOTS =
  Number(process.env.SLOT_GENERATION_DAYS) || 30;
