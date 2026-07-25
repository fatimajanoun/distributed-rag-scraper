import Fastify from "fastify";
import { connectRedis } from "./queue/redis.js";
import { healthRoutes } from "./routes/health.js";
import {askRoutes} from "./routes/ask.js";
const app = Fastify({
  logger: true,
});

app.register(healthRoutes);
await app.register(askRoutes, {
  prefix: "/api",
});
const start = async () => {
  await connectRedis();

  await app.listen({
    port: Number(process.env.PORT ?? 3000),
    host: "0.0.0.0",
  });
};

void start();