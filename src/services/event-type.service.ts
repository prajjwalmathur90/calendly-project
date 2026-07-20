import slug from "slug";
import { CreateEventDto, UpdateEventDto } from "../dtos/event.dto.js";
import {
  createEvent,
  deleteEvent,
  getByHostIdOrSlug,
  getEventByHostId,
  getEventById,
  updateEvent,
} from "../repositories/event-type.repository.js";
import { conflict, forbidden, notFound } from "../utils/api-error.js";
import { getByID } from "../repositories/user.repository.js";
import { startRegenerateHostSlotsWorkflow } from "../temporal/client.js";
import { regenerateHostSlotsWorkflow } from "../temporal/workflows/slot-generation.workflow.js";

export async function listEventService(hostId: number) {
  const event = await getEventByHostId(hostId);
  if (!event) {
    throw notFound("No Events found");
  }
  return event;
}

export async function findEventByIDService(hostId: number, id: number) {
  const event = await getEventById(id);
  if (!event) {
    throw notFound("Event not found");
  }

  if (event.hostId !== hostId) {
    throw forbidden("You are not authorized to view this event");
  }
  return event;
}

export async function createEventService(hostId: number, data: CreateEventDto) {
  const slugPassed = data.slug ?? slug(data.title, { lower: true });

  if (!slugPassed) {
    throw conflict("Could not generate a slug for the event type");
  }

  const isSlugTaken = await getByHostIdOrSlug(hostId, slugPassed);
  if (isSlugTaken) {
    throw conflict(
      "A event type with this slug already exists, please use a different slug",
    );
  }

  const host = await getByID(hostId);
  if (!host) {
    throw notFound("Host not found");
  }

  const eventType = createEvent(hostId, { ...data, slug: slugPassed });
  await startRegenerateHostSlotsWorkflow({ hostId });
  return eventType;
}

export async function updateEventService(
  hostId: number,
  id: number,
  data: UpdateEventDto,
) {
  const eventType = await getEventById(id);
  if (!eventType) {
    throw notFound("Event type not found");
  }
  if (eventType.hostId !== hostId) {
    throw forbidden("You are not authorized to update this event type");
  }

  if (data.slug && data.slug !== eventType.slug) {
    const isSlugTaken = await getByHostIdOrSlug(hostId, data.slug);
    if (isSlugTaken) {
      throw conflict(
        "A event type with this slug already exists, please use a different slug",
      );
    }
  }

  const updateEventType = await updateEvent(id, data);
  await regenerateHostSlotsWorkflow({ hostId });
  return updateEventType;
}

export async function deleteEventService(hostId: number, id: number) {
  const event = await getEventById(id);
  if (!event) {
    throw notFound("Event doesn't exist");
  }
  if (event.hostId !== hostId) {
    throw forbidden("You are not authorized to delete for this event.");
  }
  const removeEventType = await deleteEvent(id);
  await regenerateHostSlotsWorkflow({ hostId });
  return removeEventType;
}

export async function findEventByIdPublicService(
  hostId: number,
  eventSlug: string,
) {
  const event = await getByHostIdOrSlug(hostId, eventSlug);

  if (!event) {
    throw notFound("Event not found");
  }

  const host = await getByID(hostId);
  if (!host) {
    throw notFound("Host not found");
  }

  return {
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      durationMinutes: event.durationMinutes,
      loactionType: event.locationType,
    },
    host: {
      name: host.name,
      email: host.email,
    },
  };
}
