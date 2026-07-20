import Fastify from "fastify";
import { db } from "./db.js";
import { connectRedis, redis } from "./redis.js";


const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  const result = await db.query("SELECT NOW()");
  const redisResult = await redis.ping();

  return {
    status: "ok",
    service: "api",
    database: "connected",
    databaseTime: result.rows[0].now,
    redis: redisResult,
  };
});

const start = async (): Promise<void> => {
  try {
    await connectRedis();
    await app.listen({
      port: Number(process.env.PORT ?? 3000),
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();