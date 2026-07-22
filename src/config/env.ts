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

export const TEMPORAL_ADDRESS =
  process.env.TEMPORAL_ADDRESS || "localhost:7233";
export const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE || "default";
export const TEMPORAL_TASK_QUEUE =
  process.env.TEMPORAL_TASK_QUEUE || "calendly_tasks";

export const TEMPORAL_ENABLED = "true";

export const SMTP_HOST = process.env.SMTP_HOST || "localhost";
export const SMTP_PORT = Number(process.env.SMTP_PORT) || 1025;
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Calendly <noreply@example.com>";
