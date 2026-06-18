import express, { Express } from "express";
import { userRouter } from "./routers/user.router.js";

const app: Express = express();

app.get("/health", (_req, res) => {
  res.json({
    status: "ok!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/users", userRouter);

export { app };
