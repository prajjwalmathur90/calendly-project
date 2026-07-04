import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  findAllEvents,
  findEventsByID,
  updateEvent,
} from "../controllers/event-type.controller.js";
import { validate } from "../middlewares/validate.js";
import { createEventSchema, updateEventSchema } from "../dtos/event.dto.js";

export const eventRouter: Router = Router();

eventRouter.get("/", findAllEvents);
eventRouter.get("/:id", findEventsByID);
eventRouter.post("/new", validate(createEventSchema), createEvent);
eventRouter.post("/:id", validate(updateEventSchema), updateEvent);
eventRouter.delete("/:id", deleteEvent);
