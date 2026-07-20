import { FastifyInstance } from "fastify";
import { db } from "../database/db.js";
import { redis } from "../queue/redis.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    const databaseResult = await db.query("SELECT NOW()");
    const redisResult = await redis.ping();

    return {
      status: "ok",
      service: "api",
      database: "connected",
      databaseTime: databaseResult.rows[0].now,
      redis: redisResult,
    };
  });
}