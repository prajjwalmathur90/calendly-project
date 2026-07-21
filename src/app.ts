import express, { Express } from "express";
import { userRouter } from "./routers/user.router.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { routeNotFound } from "./middlewares/route-not-found.js";
import { eventRouter } from "./routers/event-type.router.js";
import { publicEventRouter } from "./routers/public-event.router.js";
import { availabilityRouter } from "./routers/availability.router.js";
import { bookingRouter } from "./routers/booking.router.js";

const app: Express = express();

// it helps to deserialize the rqeuest body into the javascript object
app.use(
  express.json({
    type: (req) => {
      const contentType = req.headers["content-type"];
      const method = req.method ?? "";

      if (!contentType) {
        return ["POST", "PUT", "PATCH"].includes(method);
      }

      const value = Array.isArray(contentType) ? contentType[0] : contentType;
      if (!value) return false;

      return (
        value.includes("application/json") ||
        value.includes("+json") ||
        value.includes("text/plain")
      );
    },
  }),
);
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
app.use("/availability", availabilityRouter);
app.use("/public", publicEventRouter);
app.use("/bookings", bookingRouter);
app.use(routeNotFound);
app.use(errorHandler);
export { app };
