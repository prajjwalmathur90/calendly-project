import { Router } from "express";
import { setupGoogleCallback } from "../controllers/google-calendar.controller.js";

export const calendarRouter: Router = Router();

calendarRouter.get("/callback", setupGoogleCallback);
