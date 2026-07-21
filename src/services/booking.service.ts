import { CreateBookingDto } from "../dtos/booking.js";
import { prisma } from "../config/database.js";
import { badRequest, notFound } from "../utils/api-error.js";

export async function createBookingOptimistically(
  userId: number,
  dto: CreateBookingDto,
) {
  const booking = await prisma.$transaction(async (tx) => {
    const slot = await tx.slots.findUnique({
      where: { id: dto.slotId },
    });

    if (!slot) {
      throw notFound("Slot not found");
    }

    if (slot.status !== "AVAILABLE") {
      throw badRequest("Slot is not available");
    }

    if (slot.endAt < new Date()) {
      throw badRequest("Slot has already started");
    }

    const updated = await tx.slots.updateMany({
      where: {
        id: dto.slotId,
        status: "AVAILABLE",
      },
      data: {
        status: "BOOKED",
      },
    });

    if (updated.count !== 1) {
      throw badRequest("Slot already booked");
    }

    return tx.booking.create({
      data: {
        slotId: dto.slotId,
        inviteeEmail: dto.inviteeEmail,
        inviteeName: dto.inviteeName,
        inviteeNotes: dto.inviteeNotes,
        status: "CONFIRMED",
        hostId: userId,
        eventTypeId: slot.eventId,
      },
      include: {
        slot: true,
      },
    });
  });

  return {
    booking: {
      id: booking.id,
      status: booking.status,
      startAt: booking.slot.startAt.toISOString(),
      endAt: booking.slot.endAt.toISOString(),
    },
  };
}

export async function createBookingPessimistically(
  userId: number,
  dto: CreateBookingDto,
) {
  const booking = await prisma.$transaction(async (tx) => {
    // Pessimistic lock using SELECT ... FOR UPDATE
    const slots = await tx.$queryRaw<any[]>`
      SELECT * FROM slots 
      WHERE id = ${dto.slotId} 
      FOR UPDATE
    `;

    if (!slots || slots.length === 0) {
      throw notFound("Slot not found");
    }

    const slot = slots[0];

    if (slot.status !== "AVAILABLE") {
      throw badRequest("Slot is not available");
    }

    const endAt = slot.endAt instanceof Date ? slot.endAt : new Date(slot.endAt);
    if (endAt < new Date()) {
      throw badRequest("Slot has already started");
    }

    await tx.slots.update({
      where: {
        id: dto.slotId,
      },
      data: {
        status: "BOOKED",
      },
    });

    return tx.booking.create({
      data: {
        slotId: dto.slotId,
        inviteeEmail: dto.inviteeEmail,
        inviteeName: dto.inviteeName,
        inviteeNotes: dto.inviteeNotes,
        status: "CONFIRMED",
        hostId: userId,
        eventTypeId: slot.eventId,
      },
      include: {
        slot: true,
      },
    });
  });

  return {
    booking: {
      id: booking.id,
      status: booking.status,
      startAt: booking.slot.startAt.toISOString(),
      endAt: booking.slot.endAt.toISOString(),
    },
  };
}
