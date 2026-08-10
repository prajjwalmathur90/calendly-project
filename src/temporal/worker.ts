import { NativeConnection, Worker } from "@temporalio/worker";
import {
  TEMPORAL_ADDRESS,
  TEMPORAL_NAMESPACE,
  TEMPORAL_TASK_QUEUE,
} from "../config/env.js";
import * as activities from "./activities/index.js";
import { fileURLToPath } from "node:url";
import { connectRedis } from "../services/redis.service.js";

async function run() {
  // Connect Redis before starting the worker — activities like
  // createGoogleCalendarEventActivity need it to fetch tokens.
  await connectRedis();

  const connection = await NativeConnection.connect({
    address: TEMPORAL_ADDRESS,
  });

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    taskQueue: TEMPORAL_TASK_QUEUE,
    activities,
    workflowsPath: fileURLToPath(
      new URL("./workflows/index.ts", import.meta.url),
    ),
  });
  console.log(
    `[temporal] Worker started for task queue: ${TEMPORAL_TASK_QUEUE}`,
  );
  await worker.run();
}

run().catch((err) => {
  console.error("[temporal] Error starting worker", err);
  process.exit(1);
});
