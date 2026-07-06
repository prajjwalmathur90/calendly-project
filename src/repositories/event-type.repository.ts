import { prisma } from "../config/database.js";
import { CreateEventDto, UpdateEventDto } from "../dtos/event.dto.js";

export async function getEventByHostId(hostId: number) {
  const event = await prisma.eventTypes.findMany({
    where: {
      hostId,
    },
  });

  return event;
}

export async function getEventById(id: number) {
  const event = await prisma.eventTypes.findUnique({
    where: {
      id,
    },
  });

  return event;
}

export async function createEvent(
  hostId: number,
  data: CreateEventDto & { slug: string },
) {
  const event = await prisma.eventTypes.create({
    data: {
      hostId,
      ...data,
    },
  });
  return event;
}

export async function updateEvent(id: number, data: UpdateEventDto) {
  return prisma.eventTypes.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteEvent(id: number) {
  const event = await prisma.eventTypes.delete({
    where: {
      id,
    },
  });

  return event;
}

export async function getActiveByHostIdOrSlug(hostId: number, slug: string) {
  const event = await prisma.eventTypes.findFirst({
    where: {
      isActive: true,
      hostId,
      slug,
    },
  });

  return event;
}

export async function getByHostIdOrSlug(hostId: number, slug: string) {
  const event = await prisma.eventTypes.findFirst({
    where: {
      hostId,
      slug,
    },
  });

  return event;
}

export async function slugExistsForHost(hostId: number, slug: string) {
  const host = await prisma.eventTypes.findFirst({
    where: {
      hostId,
      slug,
    },
  });

  return host !== null;
}
