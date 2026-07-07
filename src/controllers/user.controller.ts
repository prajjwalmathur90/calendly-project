import {
  findAllUsers as findAllUsersService,
  findById as findByIdService,
  createService as createService,
  findByEmail as findByEmailService,
  updateUserService,
  deleteUserById as deleteUserByIdService,
} from "../services/user.service.js";

import { Request, Response } from "express";
import { sendSuccess } from "../utils/api-response.js";

export async function findAllUsers(req: Request, res: Response) {
  const email = req.query.email as string;

  if (email) {
    const user = await findByEmailService(email);
    return sendSuccess(res, user);
  }

  const users = await findAllUsersService();
  return sendSuccess(res, users);
}

export async function findById(req: Request, res: Response) {
  const { id } = req.params;
  const response = await findByIdService(Number(id));
  return sendSuccess(res, response);
}

export async function create(req: Request, res: Response) {
  const response = await createService(req.body);
  sendSuccess(res, response, 201, "User Created Successfully");
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const user = await updateUserService(Number(id), req.body);
  return sendSuccess(res, user, 200, "User updated Successfully");
}

export async function deleteUserById(req: Request, res: Response) {
  const { id } = req.params;
  const user = await deleteUserByIdService(Number(id));

  return sendSuccess(res, user, 200, "User Deleted Successfully");
}
