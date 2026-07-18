import { prisma } from "../config/database.js";

export async function findBookedSlotsByHostInRange(
  hostId: number,
  startTime: Date,
  endTime: Date,
) {
  return await prisma.slots.findMany({
    where: {
      hostId,
      startAt: {
        gte: startTime,
        lte: endTime,
      },
      status: "BOOKED",
    },
  });
}

export async function upsertSlot(
  eventId: number,
  hostId: number,
  startAt: Date,
  endAt: Date,
  status: "AVAILABLE" | "BOOKED" | "BLOCKED" = "AVAILABLE"
) {
  return await prisma.slots.upsert({
    where: {
      eventId_startAt_endAt: {
        eventId,
        startAt,
        endAt,
      },
    },
    create: {
      hostId,
      eventId,
      startAt,
      endAt,
      status,
    },
    update: {
      status,
    },
  });
}

export async function findSlotsByEventInRange(
  eventId: number,
  from: Date,
  to: Date,
  statuses: ("AVAILABLE" | "BOOKED" | "BLOCKED")[]
) {
  return await prisma.slots.findMany({
    where: {
      eventId,
      startAt: {
        gte: from,
        lte: to,
      },
      status: {
        in: statuses,
      },
    },
  });
}

export async function updateSlotStatus(id: string, status: "AVAILABLE" | "BOOKED" | "BLOCKED") {
  return await prisma.slots.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}
