import { createClient } from "redis";
import { REDIS_URL } from "../config/env.js";

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not configured");
}

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected successfully!!");
  }
}
