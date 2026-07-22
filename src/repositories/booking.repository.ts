import { prisma } from "../config/database.js";
import { CreateBookingDto } from "../dtos/booking.js";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function createBookingInTx(
  tx: TxClient,
  userId: number,
  slot: any, // or we can just pass the data
  dto: CreateBookingDto,
) {
  return tx.booking.create({
    data: {
      slotId: dto.slotId,
      inviteeEmail: dto.inviteeEmail,
      inviteeName: dto.inviteeName,
      inviteeNotes: dto.inviteeNotes,
      status: "CONFIRMED",
      hostId: slot.hostId,
      eventTypeId: slot.eventId,
    },
    include: {
      slot: true,
    },
  });
}

export async function listHostBookings(
  userId: number,
  filters: { from?: Date; to?: Date; status?: string },
) {
  const where: any = {
    hostId: userId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.from || filters.to) {
    where.slot = {};
    if (filters.from) {
      where.slot.startAt = { ...where.slot.startAt, gte: filters.from };
    }
    if (filters.to) {
      where.slot.startAt = { ...where.slot.startAt, lte: filters.to };
    }
  }

  return prisma.booking.findMany({
    where,
    include: {
      slot: true,
      eventType: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getBookingById(bookingId: number) {
  const booking = prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      slot: true,
      eventType: true,
      host: true,
    },
  });

  return booking;
}
