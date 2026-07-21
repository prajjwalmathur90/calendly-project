import { prisma } from "../config/database.js";
import { CreateBookingDto } from "../dtos/booking.js";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function createBookingInTx(
  tx: TxClient,
  userId: number,
  slot: any, // or we can just pass the data
  dto: CreateBookingDto
) {
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
}
