import { Router } from "express";
import { findPublicEvent } from "../controllers/event-type.controller.js";

export const publicEventRouter: Router = Router();

publicEventRouter.get("/users/:userId/events/:slug", findPublicEvent);
