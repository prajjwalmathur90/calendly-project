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
