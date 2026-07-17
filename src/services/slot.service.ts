import { DateTime } from "luxon";
import { prisma } from "../config/database.js";
import { SLOT_GENERATION_SLOTS } from "../config/env.js";
import {
  findActiveAvailablity,
  findExceptionsByUserInRange,
} from "../repositories/availability.js";
import { getActiveEventsByHost } from "../repositories/event-type.repository.js";
import { findBookedSlotsByHostInRange } from "../repositories/slots.js";
import {
  applyExceptionsForDate,
  overlapsBooked,
  splitIntoSlots,
  TimeWindow,
  windowsForWeekdayRule,
} from "./slot-generation.service.js";

export interface RegenerateHostSlotsInput {
  hostId: number;
  from?: string;
  to?: string;
}

export async function regenerateHostSlots(input: RegenerateHostSlotsInput) {
  const host = await prisma.user.findUnique({ where: { id: input.hostId } });
  if (!host) {
    return;
  }

  const from = input.from
    ? DateTime.fromISO(input.from, { zone: "utc" }).startOf("day")
    : DateTime.now().startOf("day");

  const to = input.to
    ? DateTime.fromISO(input.to, { zone: "utc" }).startOf("day")
    : from.plus({ days: SLOT_GENERATION_SLOTS }).endOf("day");

  const [rules, exceptions, eventTypes, bookedSlots] = await Promise.all([
    findActiveAvailablity(input.hostId),
    findExceptionsByUserInRange(input.hostId, from.toJSDate(), to.toJSDate()),
    getActiveEventsByHost(input.hostId),
    findBookedSlotsByHostInRange(input.hostId, from.toJSDate(), to.toJSDate()),
  ]);

  const bookedWindow: TimeWindow[] = bookedSlots.map((slot) => {
    return {
      start: DateTime.fromJSDate(slot.startAt, { zone: "utc" }),
      end: DateTime.fromJSDate(slot.endAt, { zone: "utc" }),
    };
  });

  for (const eventType of eventTypes) {
    const generatedValidSlotKeys = new Set<String>();

    for (let cursor = from; cursor <= to; cursor = cursor.plus({ days: 1 })) {
      const dateKey = cursor.toISODate();

      const dayExceptions = exceptions.filter(
        (ex) =>
          DateTime.fromJSDate(ex.date, { zone: "utc" }).toISODate() === dateKey,
      );
      const dayExceptionsWithTimezone = dayExceptions.map((ex) => ({
        type: ex.type,
        startTime: ex.startTime,
        endTime: ex.endTime,
        timezone: ex.timezone,
      }));

      let windows: TimeWindow[] = [];

      // convert rules into time windows
      for (const rule of rules) {
        windows.push(
          ...windowsForWeekdayRule(
            cursor,
            rule.weekday,
            rule.startTime,
            rule.endTime,
            rule.timezone,
          ),
        );
      }

      // apply exceptions to the windows
      windows = applyExceptionsForDate(
        cursor,
        windows,
        dayExceptionsWithTimezone,
      );

      const slots = splitIntoSlots(
        windows,
        eventType.durationMinutes,
        eventType.bufferBeforeMinutes,
        eventType.bufferAfterMinutes,
      ).filter((slot) => {
        slot.start > DateTime.utc() &&
          !overlapsBooked(
            slot,
            bookedWindow,
            eventType.bufferBeforeMinutes,
            eventType.bufferAfterMinutes,
          );
      }); // slots filtered to exclude past slots that overlap with booked slots

      for (const slot of slots) {
        const startAt = slot.start.toUTC().toJSDate();
        const endAt = slot.end.toUTC().toJSDate();

        const key = `${eventType.id}|${startAt.toISOString()}|${endAt.toISOString()}`;

        generatedValidSlotKeys.add(key);

        await prisma.slots.upsert({
          where: {
            eventId_startAt_endAt: {
              eventId: eventType.id,
              startAt,
              endAt,
            },
          },
          create: {
            hostId: input.hostId,
            eventId: eventType.id,
            startAt,
            endAt,
            status: "AVAILABLE",
          },
          update: {
            startAt: "AVAILABLE",
          },
        });
      }
    }

    const futureSlots = await prisma.slots.findMany({
      where: {
        eventId: eventType.id,
        startAt: { gte: from.toJSDate(), lte: to.toJSDate() },
        status: { in: ["AVAILABLE", "BLOCKED"] },
      },
    });

    for (const slot of futureSlots) {
      const key = `${eventType.id}|${slot.startAt.toISOString()}|${slot.endAt.toISOString()}`;
      if (!generatedValidSlotKeys.has(key)) {
        await prisma.slots.update({
          where: { id: slot.id },
          data: { status: "BLOCKED" },
        });
      }
    }
  }
}
