import {
  findAllUsers as findAllUsersService,
  findById as findByIdService,
  create as createService,
  findByEmail as findByEmailService,
  updateById as updateByIdService,
  deleteUserById as deleteUserByIdService,
} from "../services/user.service.js";

import { Request, Response } from "express";

export async function findAllUsers(_req: Request, _res: Response) {
  const email = _req.query.email as string;

  if (email) {
    const user = await findByEmailService(email);
    return _res.json(user);
  }

  const users = await findAllUsersService();
  return _res.json(users);
}

export async function findById(_req: Request, _res: Response) {
  const { id } = _req.params;
  const response = await findByIdService(Number(id));
  _res.json(response);
}

export async function create(req: Request, res: Response) {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const response = await createService(name, email);
    return res.status(201).json({
      message: "User Created Successfully",
      response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function updateName(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const user = await updateByIdService(name, Number(id));

    return res.status(200).json({
      message: "User Updated Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function deleteUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await deleteUserByIdService(Number(id));

    return res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    return res.status(404).json({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}
