import { CreateEventDto, UpdateEventDto } from "../dtos/event.dto.js";
import {
  createEvent,
  deleteEvent,
  getAllEvent,
  getEventByID,
  updateEvent,
} from "../repositories/event-type.repository.js";
import { getByID } from "../repositories/user.repository.js";
import { notFound } from "../utils/api-error.js";

export async function findAllEventService() {
  const events = await getAllEvent();
  if (!events) {
    throw notFound("No events found!!");
  }
  return events;
}

export async function findEventByIDService(id: number) {
  const event = await getEventByID(id);
  if (!event) {
    throw notFound("Event not found");
  }
  return event;
}

export async function createEventService(data: CreateEventDto) {
  const user = await getByID(data.hostId);

  if (!user) {
    throw notFound("Host user not found");
  }

  return createEvent(data);
}

export async function updateEventService(id: number, data: UpdateEventDto) {
  const event = await updateEvent(id, data);
  if (!event) {
    throw notFound("Event not found");
  }

  return event;
}

export async function deleteEventService(id: number) {
  const event = await deleteEvent(id);
  if (!event) {
    throw notFound("Event doesn't exist");
  }
  return event;
}
