import { CreateBookingDto } from "../dtos/booking.js";
import { prisma } from "../config/database.js";
import { badRequest, notFound } from "../utils/api-error.js";
import {
  findSlotByIdInTx,
  updateSlotStatusOptimisticallyInTx,
  findSlotByIdPessimisticallyInTx,
  updateSlotStatusInTx,
} from "../repositories/slots.repository.js";
import { createBookingInTx } from "../repositories/booking.repository.js";

export async function createBookingOptimistically(
  userId: number,
  dto: CreateBookingDto,
) {
  const booking = await prisma.$transaction(async (tx) => {
    const slot = await findSlotByIdInTx(tx as any, dto.slotId);

    if (!slot) {
      throw notFound("Slot not found");
    }

    if (slot.status !== "AVAILABLE") {
      throw badRequest("Slot is not available");
    }

    if (slot.endAt < new Date()) {
      throw badRequest("Slot has already started");
    }

    const updated = await updateSlotStatusOptimisticallyInTx(
      tx as any,
      dto.slotId,
      "AVAILABLE",
      "BOOKED"
    );

    if (updated.count !== 1) {
      throw badRequest("Slot already booked");
    }

    return createBookingInTx(tx as any, userId, slot, dto);
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
    const slots = await findSlotByIdPessimisticallyInTx(tx as any, dto.slotId);

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

    await updateSlotStatusInTx(tx as any, dto.slotId, "BOOKED");

    return createBookingInTx(tx as any, userId, slot, dto);
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
