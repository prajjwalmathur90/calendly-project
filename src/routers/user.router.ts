import { Router } from "express";
import {
  findAllUsers,
  findById,
  create,
  updateUser,
  deleteUserById,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema, updateUserSchema } from "../dtos/user.dto.js";

export const userRouter: Router = Router();

userRouter.get("/", findAllUsers);
userRouter.get("/:id", findById);
userRouter.post("/new", validate(createUserSchema), create);
userRouter.patch("/:id", validate(updateUserSchema), updateUser);
userRouter.delete("/:id", deleteUserById);
