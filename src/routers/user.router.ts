import { Router } from "express";
import {
  findAllUsers,
  findById,
  create,
  updateUserNameById,
  deleteUserById,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema, updateUserNameSchema } from "../dtos/user.dts.js";

export const userRouter: Router = Router();

userRouter.get("/", findAllUsers);
userRouter.get("/:id", findById);
userRouter.post("/new", validate(createUserSchema), create);
userRouter.put("/:id", validate(updateUserNameSchema), updateUserNameById);
userRouter.delete("/:id", deleteUserById);
