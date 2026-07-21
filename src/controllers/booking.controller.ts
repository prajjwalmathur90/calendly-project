import {
  createBookingOptimistically,
  listHostBooking,
} from "../services/booking.service.js";
import { Request, Response } from "express";
import { sendSuccess } from "../utils/api-response.js";

export async function createBookingOptimisticallyController(
  req: Request,
  res: Response,
) {
  const response = await createBookingOptimistically(req.userId, req.body);
  sendSuccess(res, response, 201, "Booking Created Successfully");
}

export async function listHostBookingController(req: Request, res: Response) {
  const filters: { from?: Date; to?: Date; status?: string } = {};

  if (req.query.from) {
    filters.from = new Date(req.query.from as string);
  }
  if (req.query.to) {
    filters.to = new Date(req.query.to as string);
  }
  if (req.query.status) {
    filters.status = req.query.status as string;
  }

  const response = await listHostBooking(req.userId, filters);
  sendSuccess(res, response, 200, "Bookings Fetched Successfully");
}
