import express, { Express } from "express";
import { userRouter } from "./routers/user.router.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { routeNotFound } from "./middlewares/route-not-found.js";
import { eventRouter } from "./routers/event-type.router.js";
import { publicEventRouter } from "./routers/public-event.router.js";

const app: Express = express();

// it helps to deserialize the rqeuest body into the javascript object
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/users", userRouter);
app.use("/events", eventRouter);
app.use("/public", publicEventRouter);

app.use(routeNotFound);
app.use(errorHandler);
export { app };
