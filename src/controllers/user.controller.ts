import {
  findAllUsers as findAllUsersService,
  findById as findByIdService,
  createService as createService,
  findByEmail as findByEmailService,
  updateById as updateByIdService,
  deleteUserById as deleteUserByIdService,
} from "../services/user.service.js";

import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../utils/api-response.js";

export async function findAllUsers(_req: Request, _res: Response) {
  const email = _req.query.email as string;

  if (email) {
    const user = await findByEmailService(email);
    return sendSuccess(_res, user);
  }

  const users = await findAllUsersService();
  return sendSuccess(_res, users);
}

export async function findById(_req: Request, _res: Response) {
  const { id } = _req.params;
  const response = await findByIdService(Number(id));
  return sendSuccess(_res, response);
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await createService(req.body);

    return sendSuccess(res, response, 201, "User Created Successfully");
  } catch (error) {
    return next(error);
  }
}

export async function updateName(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const user = await updateByIdService(name, Number(id));

    return sendSuccess(res, user, 200, "User updated Successfully");
  } catch (error) {
    return next(error);
  }
}

export async function deleteUserById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const user = await deleteUserByIdService(Number(id));

    return sendSuccess(res, user, 200, "User Deleted Successfully");
  } catch (error) {
    next(error);
  }
}
