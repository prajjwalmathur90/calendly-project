import { Request, Response } from "express";
import {
  createEventService,
  deleteEventService,
  findAllEventService,
  findEventByIDService,
  updateEventService,
} from "../services/event-type.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function findAllEvents(_req: Request, res: Response) {
  const events = await findAllEventService();
  sendSuccess(res, events);
}

export async function findEventsByID(req: Request, res: Response) {
  const { id } = req.params;
  const event = await findEventByIDService(Number(id));
  sendSuccess(res, event);
}

export async function createEvent(req: Request, res: Response) {
  const response = await createEventService(req.body);
  sendSuccess(res, response, 201, "Event Created Successcully");
}

export async function updateEvent(req: Request, res: Response) {
  const { id } = req.params;
  const response = await updateEventService(Number(id), req.body);
  sendSuccess(res, response, 200, "Event Updated Successfully");
}

export async function deleteEvent(req: Request, res: Response) {
  const { id } = req.params;
  const event = await deleteEventService(Number(id));
  sendSuccess(res, event, 200, "Event deleted Successfully");
}
