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
  const { userId } = req.params;
  const events = await listEventService(Number(userId));
  sendSuccess(res, events);
}

export async function findEventByID(req: Request, res: Response) {
  const { id, userId } = req.params;
  const event = await findEventByIDService(Number(userId), Number(id));
  sendSuccess(res, event);
}

export async function createEvent(req: Request, res: Response) {
  const { userId } = req.params;
  const response = await createEventService(Number(userId), req.body);
  sendSuccess(res, response, 201, "Event Created Successcully");
}

export async function updateEvent(req: Request, res: Response) {
  const { id, userId } = req.params;
  const response = await updateEventService(
    Number(userId),
    Number(id),
    req.body,
  );
  sendSuccess(res, response, 200, "Event Updated Successfully");
}

export async function deleteEvent(req: Request, res: Response) {
  const { userId, id } = req.params;
  const event = await deleteEventService(Number(userId), Number(id));
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
