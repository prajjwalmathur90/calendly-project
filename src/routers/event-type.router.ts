import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  findAllEvents,
  findEventByID,
  updateEvent,
} from "../controllers/event-type.controller.js";
import { validate } from "../middlewares/validate.js";
import { createEventSchema, updateEventSchema } from "../dtos/event.dto.js";
import { requireUserId } from "../middlewares/require-userId.js";

export const eventRouter: Router = Router();

eventRouter.use(requireUserId);

eventRouter.get("/", findAllEvents);
eventRouter.get("/:id", findEventByID);
eventRouter.post("/new", validate(createEventSchema), createEvent);
eventRouter.patch("/:id", validate(updateEventSchema), updateEvent);
eventRouter.delete("/:id", deleteEvent);
