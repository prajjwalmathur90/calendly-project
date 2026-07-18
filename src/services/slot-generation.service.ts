import { DateTime, Interval } from "luxon";

// Represents any interval of time in the scheduling engine.
// Almost every algorithm works with this common structure.
export interface TimeWindow {
  start: DateTime;
  end: DateTime;
}

// Combines a date and a clock time into a complete DateTime
// in the user's timezone.
export function parseTimeOnDate(
  date: DateTime,
  time: string,
  timezone: string,
) {
  const [hour, minute] = time.split(":").map(Number);

  return date.setZone(timezone).set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
}

// Merges overlapping availability windows into one.
// Example:
// 9-12 and 11-3  ->  9-3
export function mergeWindows(windows: TimeWindow[]): TimeWindow[] {
  if (windows.length == 0) return [];

  // Sort windows by start time before merging.
  const sorted = [...windows].sort(
    (a, b) => a.start.toMillis() - b.start.toMillis(),
  );

  const mergedResult: TimeWindow[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = mergedResult[mergedResult.length - 1];

    // Extend the previous window if they overlap.
    if (last.end >= current.start) {
      last.end = current.end > last.end ? current.end : last.end;
    } else {
      // Otherwise start a new merged window.
      mergedResult.push(current);
    }
  }

  return mergedResult;
}

// Converts availability windows into individual meeting slots.
export function splitIntoSlots(
  windows: TimeWindow[],
  durationMinutes: number,
  bufferBeforeMinutes: number,
  bufferAfterMinutes: number,
): TimeWindow[] {
  const slots: TimeWindow[] = [];

  // Total occupied time for one meeting including buffers.
  const totalMinutes =
    durationMinutes + bufferBeforeMinutes + bufferAfterMinutes;

  for (const window of windows) {
    let cursor = window.start;

    // Keep generating while an entire occupied interval fits.
    while (cursor.plus({ minutes: totalMinutes }) <= window.end) {
      // Meeting starts after the before-buffer.
      const slotStart = cursor.plus({ minutes: bufferBeforeMinutes });

      // Meeting ends after its duration.
      const slotEnd = slotStart.plus({ minutes: durationMinutes });

      slots.push({ start: slotStart, end: slotEnd });

      // Move cursor to the next possible meeting.
      cursor = cursor.plus({ minutes: durationMinutes });
    }
  }

  return slots;
}

// Removes one blocked interval from a list of windows.
// Example:
// Availability : 9-5
// Block        : 12-1
// Result       : 9-12, 1-5
export function subtractWindow(windows: TimeWindow[], block: TimeWindow) {
  const result: TimeWindow[] = [];

  for (const window of windows) {
    const interval = Interval.fromDateTimes(window.start, window.end);
    const blockInterval = Interval.fromDateTimes(block.start, block.end);

    // If there is no overlap, keep the window unchanged.
    if (!interval.overlaps(blockInterval)) {
      result.push(window);
      continue;
    }

    // Keep the left portion if it exists.
    if (block.start > window.start) {
      result.push({ start: window.start, end: block.start });
    }

    // Keep the right portion if it exists.
    if (block.end < window.end) {
      result.push({ start: block.end, end: window.end });
    }
  }

  // Remove invalid windows (if any).
  return result.filter((w) => w.end >= w.start);
}

// Checks whether a candidate slot overlaps an existing booking.
// Buffers are considered part of the occupied interval.
export function overlapsBooked(
  slot: TimeWindow,
  booked: TimeWindow[],
  bufferBeforeMinutes: number,
  bufferAfterMinutes: number,
): boolean {
  // Expand the meeting using its buffers.
  const paddedStart = slot.start.minus({ minutes: bufferBeforeMinutes });
  const paddedEnd = slot.end.plus({ minutes: bufferAfterMinutes });

  // Return true if it overlaps any booked slot.
  return booked.some((b) => {
    const interval = Interval.fromDateTimes(paddedStart, paddedEnd);
    const bookedInterval = Interval.fromDateTimes(b.start, b.end);

    return interval.overlaps(bookedInterval);
  });
}

// Applies all exceptions for one particular day.
// Handles:
// - Full-day blocks
// - Partial blocks
// - Additional availability
export function applyExceptionsForDate(
  date: DateTime,
  baseWindows: TimeWindow[],
  exceptions: Array<{
    type: string;
    startTime: string | null;
    endTime: string | null;
    timezone: string;
  }>,
): TimeWindow[] {
  // Start with the day's normal availability.
  let windows = [...baseWindows];

  for (const ex of exceptions) {
    // Entire day becomes unavailable.
    if (ex.type === "BLOCK_FULL_DAY") {
      return [];
    }

    // Remove blocked interval from availability.
    if (ex.type === "BLOCK_PARTIAL" && ex.startTime && ex.endTime) {
      const block = {
        start: parseTimeOnDate(date, ex.startTime, ex.timezone),
        end: parseTimeOnDate(date, ex.endTime, ex.timezone),
      };

      windows = subtractWindow(windows, block);
    }

    // Add an extra available window.
    if (ex.type === "ADD_AVAILABLE_WINDOW" && ex.startTime && ex.endTime) {
      windows.push({
        start: parseTimeOnDate(date, ex.startTime, ex.timezone),
        end: parseTimeOnDate(date, ex.endTime, ex.timezone),
      });
    }
  }

  // Merge overlapping windows before generating slots.
  return mergeWindows(windows);
}

// Converts one recurring weekday rule into an actual window
// for a specific date.
//
// If the rule doesn't apply to this date,
// an empty array is returned.
export function windowsForWeekdayRule(
  date: DateTime,
  weekday: number,
  startTime: string,
  endTime: string,
  timeZone: string,
): TimeWindow[] {
  // Convert date into the user's timezone.
  const localDate = date.setZone(timeZone).startOf("day");

  // Luxon uses Sunday = 7 instead of 0.
  const luxonWeekday = weekday === 0 ? 7 : weekday;

  // Ignore rules that don't belong to this day.
  if (localDate.weekday !== luxonWeekday) return [];

  // Convert clock times into actual timestamps.
  const start = parseTimeOnDate(localDate, startTime, timeZone);
  const end = parseTimeOnDate(localDate, endTime, timeZone);

  // Ignore invalid rules.
  if (!start.isValid || !end.isValid || start >= end) {
    return [];
  }

  // Return today's availability window.
  return [{ start, end }];
}
