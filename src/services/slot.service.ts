// Phase 1
// --------
// Validate Input
// ↓
// Find Host

// Phase 2
// --------
// Determine Date Range

// Phase 3
// --------
// Load Data
// ↓
// Rules
// Exceptions
// Bookings
// Event Types

// Phase 4
// --------
// Normalize Data
// ↓
// Booked Slots → TimeWindows

// Phase 5
// --------
// For every Event Type
//     For every Day
//         Rules → Windows
//         Apply Exceptions
//         Merge Windows
//         Split Into Slots
//         Remove Booked Slots
//         Upsert Slots

// Phase 6
// --------
// Cleanup
// ↓
// Block stale slots

import { DateTime } from "luxon";
import { SLOT_GENERATION_SLOTS } from "../config/env.js";
import {
  findActiveAvailablity,
  findExceptionsByUserInRange,
} from "../repositories/availability.js";
import { getActiveEventsByHost } from "../repositories/event-type.repository.js";
import {
  findBookedSlotsByHostInRange,
  upsertSlot,
  findSlotsByEventInRange,
  updateSlotStatus,
} from "../repositories/slots.repository.js";
import { getByID as getUserByID } from "../repositories/user.repository.js";
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

// Main orchestration function.
// Regenerates all future slots for a host within a given date range.
export async function regenerateHostSlots(input: RegenerateHostSlotsInput) {
  // Ensure the host exists before generating slots.
  const host = await getUserByID(input.hostId);

  if (!host) {
    return;
  }

  // Use provided date range or generate from today.
  const from = input.from
    ? DateTime.fromISO(input.from, { zone: "utc" }).startOf("day")
    : DateTime.now().startOf("day").toUTC();

  const to = input.to
    ? DateTime.fromISO(input.to, { zone: "utc" }).startOf("day")
    : from.plus({ days: SLOT_GENERATION_SLOTS }).endOf("day").toUTC();

  // Fetch everything needed for slot generation in parallel.
  const [rules, exceptions, eventTypes, bookedSlots] = await Promise.all([
    findActiveAvailablity(input.hostId),
    findExceptionsByUserInRange(input.hostId, from.toJSDate(), to.toJSDate()),
    getActiveEventsByHost(input.hostId),
    findBookedSlotsByHostInRange(input.hostId, from.toJSDate(), to.toJSDate()),
  ]);

  // Convert bookings into TimeWindows so every scheduling algorithm
  // works with the same data structure.
  const bookedWindow: TimeWindow[] = bookedSlots.map((slot) => {
    return {
      start: DateTime.fromJSDate(slot.startAt, { zone: "utc" }),
      end: DateTime.fromJSDate(slot.endAt, { zone: "utc" }),
    };
  });

  // Generate slots separately for every event type.
  for (const eventType of eventTypes) {
    // Tracks every valid slot generated during this run.
    // Used later to identify obsolete database slots.
    const generatedValidSlotKeys = new Set<String>();

    // Generate slots one day at a time.
    for (let cursor = from; cursor <= to; cursor = cursor.plus({ days: 1 })) {
      const dateKey = cursor.toISODate();

      // Extract only the exceptions that belong to the current day.
      const dayExceptions = exceptions.filter(
        (ex) =>
          DateTime.fromJSDate(ex.date, {
            zone: "utc",
          }).toISODate() === dateKey,
      );

      // Keep only fields needed by the scheduling engine.
      const dayExceptionsWithTimezone = dayExceptions.map((ex) => ({
        type: ex.type,
        startTime: ex.startTime,
        endTime: ex.endTime,
        timezone: ex.timezone,
      }));

      let windows: TimeWindow[] = [];

      // Convert recurring weekday rules into actual windows
      // for the current date.
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

      // Apply holidays, blocked periods and extra availability.
      windows = applyExceptionsForDate(
        cursor,
        windows,
        dayExceptionsWithTimezone,
      );

      // Convert clean availability windows into bookable slots
      // and remove invalid ones.
      const slots = splitIntoSlots(
        windows,
        eventType.durationMinutes,
        eventType.bufferBeforeMinutes,
        eventType.bufferAfterMinutes,
      ).filter((slot) => {
        return (
          // Ignore slots in the past.
          slot.start > DateTime.utc() &&
          // Ignore slots that conflict with existing bookings.
          !overlapsBooked(
            slot,
            bookedWindow,
            eventType.bufferBeforeMinutes,
            eventType.bufferAfterMinutes,
          )
        );
      });

      // Save every valid slot.
      for (const slot of slots) {
        const startAt = slot.start.toUTC().toJSDate();
        const endAt = slot.end.toUTC().toJSDate();

        // Unique identifier used for cleanup later.
        const key = `${eventType.id}|${startAt.toISOString()}|${endAt.toISOString()}`;

        generatedValidSlotKeys.add(key);

        // Create the slot if it doesn't exist,
        // otherwise mark it AVAILABLE again.
        await upsertSlot(
          eventType.id,
          input.hostId,
          startAt,
          endAt,
          "AVAILABLE",
        );
      }
    }

    // Fetch all future slots already stored in the database
    // for this event type.
    const futureSlots = await findSlotsByEventInRange(
      eventType.id,
      from.toJSDate(),
      to.toJSDate(),
      ["AVAILABLE", "BLOCKED"],
    );

    // Any slot that was NOT regenerated during this run
    // should no longer be available.
    for (const slot of futureSlots) {
      const key = `${eventType.id}|${slot.startAt.toISOString()}|${slot.endAt.toISOString()}`;

      if (!generatedValidSlotKeys.has(key)) {
        // Soft-disable obsolete slots instead of deleting them.
        await updateSlotStatus(slot.id, "BLOCKED");
      }
    }
  }
}
