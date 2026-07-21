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

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function findSlotByIdInTx(tx: TxClient, id: string) {
  return tx.slots.findUnique({
    where: { id },
  });
}

export async function updateSlotStatusOptimisticallyInTx(
  tx: TxClient,
  id: string,
  fromStatus: string,
  toStatus: string
) {
  return tx.slots.updateMany({
    where: {
      id,
      status: fromStatus,
    },
    data: {
      status: toStatus,
    },
  });
}

export async function findSlotByIdPessimisticallyInTx(tx: TxClient, id: string) {
  return tx.$queryRaw<any[]>`
    SELECT * FROM slots 
    WHERE id = ${id} 
    FOR UPDATE
  `;
}

export async function updateSlotStatusInTx(tx: TxClient, id: string, status: string) {
  return tx.slots.update({
    where: { id },
    data: { status },
  });
}
