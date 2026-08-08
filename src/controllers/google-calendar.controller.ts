import { Request, Response } from "express";
import { exchangeSetupCode } from "../services/google-calendar.service.js";
import { badRequest } from "../utils/api-error.js";

export async function setupGoogleCallback(req: Request, res: Response) {
  const code = req.query.code as string | undefined;
  if (!code) {
    throw badRequest("No code provided");
  }

  const { refreshToken, email } = await exchangeSetupCode(code);

  res.status(200).json({
    success: true,
    data: {
      refreshToken,
      email,
    },
  });
}
