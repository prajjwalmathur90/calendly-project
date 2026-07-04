import { prisma } from "../config/database.js";
import { CreateEventDto, UpdateEventDto } from "../dtos/event.dto.js";

export async function getAllEvent() {
  const events = await prisma.eventTypes.findMany();
  return events;
}

export async function getEventByID(id: number) {
  const event = await prisma.eventTypes.findUnique({
    where: {
      id,
    },
  });

  return event;
}

export async function createEvent(data: CreateEventDto) {
  const event = await prisma.eventTypes.create({ data });
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
