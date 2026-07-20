import { createClient } from "redis";

export const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6380),
  },
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
  }
}