import { prisma } from "../config/database.js";
import {
  CreateAvailabilityExceptionDto,
  CreateAvailabilityRuleDto,
  UpdateAvailabilityExceptionDto,
  UpdateAvailabilityRuleDto,
} from "../dtos/availability.js";

export async function findAvailabilityByUser(userId: number) {
  const availabilities = await prisma.availabiltyRules.findMany({
    where: {
      userId,
    },
  });

  return availabilities;
}

export async function findAvailabilityById(id: number) {
  const availability = await prisma.availabiltyRules.findUnique({
    where: {
      id,
    },
  });

  return availability;
}

export async function findActiveAvailablity(userId: number) {
  return await prisma.availabiltyRules.findMany({
    where: {
      userId,
      isActive: true,
    },
  });
}

export async function createAvailability(
  userId: number,
  data: CreateAvailabilityRuleDto,
) {
  const availability = await prisma.availabiltyRules.create({
    data: {
      userId,
      ...data,
    },
  });

  return availability;
}

export async function updateAvailability(
  id: number,
  data: UpdateAvailabilityRuleDto,
) {
  return await prisma.availabiltyRules.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteAvailability(id: number) {
  const availability = await prisma.availabiltyRules.delete({
    where: {
      id,
    },
  });

  return availability;
}

// Availability Exception

export async function findAvailabilityExceptionByUser(userId: number) {
  return await prisma.availabiltyException.findMany({
    where: {
      userId,
    },
  });
}

export async function findAvailabilityExceptionById(id: number) {
  return await prisma.availabiltyException.findUnique({
    where: {
      id,
    },
  });
}

export async function createException(
  userId: number,
  data: CreateAvailabilityExceptionDto,
) {
  const { date, ...rest } = data;
  return prisma.availabiltyException.create({
    data: {
      userId,
      ...rest,
      date: new Date(`${date}T00:00:00.000Z`),
    },
  });
}

export async function updateException(
  id: number,
  data: UpdateAvailabilityExceptionDto,
) {
  const { date, ...rest } = data;
  return prisma.availabiltyException.update({
    where: { id },
    data: {
      ...rest,
      ...(date !== undefined && { date: new Date(`${date}T00:00:00.000Z`) }),
    },
  });
}

export async function deleteException(id: number) {
  await prisma.availabiltyException.delete({
    where: { id },
  });
}

export async function findExceptionsByUserInRange(
  userId: number,
  startDate: Date,
  endDate: Date,
) {
  return prisma.availabiltyException.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });
}
