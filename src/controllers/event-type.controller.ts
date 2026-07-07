import { Request, Response } from "express";
import {
  createEventService,
  deleteEventService,
  findEventByIdPublicService,
  findEventByIDService,
  listEventService,
  updateEventService,
} from "../services/event-type.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function findAllEvents(req: Request, res: Response) {
  const events = await listEventService(req.userId);
  sendSuccess(res, events);
}

export async function findEventByID(req: Request, res: Response) {
  const { id } = req.params;
  const event = await findEventByIDService(req.userId, Number(id));
  sendSuccess(res, event);
}

export async function createEvent(req: Request, res: Response) {
  const response = await createEventService(req.userId, req.body);
  sendSuccess(res, response, 201, "Event Created Successcully");
}

export async function updateEvent(req: Request, res: Response) {
  const { id } = req.params;
  const response = await updateEventService(req.userId, Number(id), req.body);
  sendSuccess(res, response, 200, "Event Updated Successfully");
}

export async function deleteEvent(req: Request, res: Response) {
  const { id } = req.params;
  const event = await deleteEventService(req.userId, Number(id));
  sendSuccess(res, event, 200, "Event deleted Successfully");
}

export async function findPublicEvent(req: Request, res: Response) {
  const { userId, slug } = req.params;
  const eventType = await findEventByIdPublicService(
    Number(userId),
    String(slug),
  );
  sendSuccess(res, eventType);
}
