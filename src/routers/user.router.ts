import { Router } from "express";
import {
  findAllUsers,
  findById,
  create,
  updateName,
  deleteUserById,
} from "../controllers/user.controller.js";

export const userRouter: Router = Router();

userRouter.get("/", findAllUsers);
userRouter.get("/:id", findById);
userRouter.post("/new", create);
userRouter.put("/:id", updateName);
userRouter.delete("/:id", deleteUserById);
