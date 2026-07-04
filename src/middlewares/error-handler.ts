import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";
// import { success, unknown } from "zod";
import { NODE_ENV } from "../config/env.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
    };

    if (err.details) body.details = err.details;
    res.status(err.statusCode).json(body);
    return;
  }

  console.log("[error]", err);

  const body: Record<string, unknown> = {
    success: false,
    message: "Something went wrong",
  };

  if (NODE_ENV === "developement") body.details = err.stack;

  res.status(500).json(body);
}
