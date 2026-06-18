import { findAllUsers as findAllUsersService } from "../services/user.service.js";
import { Request, Response } from "express";

export async function findAllUsers(_req: Request, _res: Response) {
  const response = await findAllUsersService();
  _res.json(response);
}
