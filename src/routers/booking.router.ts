import { Router } from "express";
import {
  createBookingOptimisticallyController,
  listHostBookingController,
} from "../controllers/booking.controller.js";
import { validate } from "../middlewares/validate.js";
import { createBookingSchema } from "../dtos/booking.js";
import { requireUserId } from "../middlewares/require-userId.js";

export const bookingRouter: Router = Router();

bookingRouter.use(requireUserId);

bookingRouter.get("/", listHostBookingController);
bookingRouter.post("/new", validate(createBookingSchema), createBookingOptimisticallyController);
