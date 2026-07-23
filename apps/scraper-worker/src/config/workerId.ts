import os from "node:os";

export const workerId =
  process.env.WORKER_ID ??
  `${os.hostname()}-${process.pid}`;