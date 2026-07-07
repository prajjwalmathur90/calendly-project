import { Router } from "express";
import {
  createException,
  createRule,
  deleteException,
  deleteRule,
  findAllExceptions,
  findAllRules,
  updateException,
  updateRule,
} from "../controllers/availability.controller.js";
import {
  createAvailabilityExceptionSchema,
  createAvailabilityRuleSchema,
  updateAvailabilityExceptionSchema,
  updateAvailabilityRuleSchema,
} from "../dtos/availability.js";
import { requireUserId } from "../middlewares/require-userId.js";
import { validate } from "../middlewares/validate.js";

export const availabilityRouter: Router = Router();

availabilityRouter.use(requireUserId);

availabilityRouter.get("/rules", findAllRules);
availabilityRouter.post(
  "/rules/new",
  validate(createAvailabilityRuleSchema),
  createRule,
);
availabilityRouter.patch(
  "/rules/:id",
  validate(updateAvailabilityRuleSchema),
  updateRule,
);
availabilityRouter.delete("/rules/:id", deleteRule);

availabilityRouter.get("/exceptions", findAllExceptions);
availabilityRouter.post(
  "/exceptions/new",
  validate(createAvailabilityExceptionSchema),
  createException,
);
availabilityRouter.patch(
  "/exceptions/:id",
  validate(updateAvailabilityExceptionSchema),
  updateException,
);
availabilityRouter.delete("/exceptions/:id", deleteException);
