import { sendBookingConfirmationEmail } from "../../mailer/booking.mailer.js";
import {
  RegenerateHostSlotsInput,
  regenerateHostSlots as runSlotGeneration,
} from "../../services/slot.service.js";
import {
  createGoogleCalendarEvent,
  isProjectCalendarConfigured,
} from "../../services/google-calendar.service.js";
import { updateBookingCalendarDetails } from "../../repositories/booking.repository.js";

export async function regenerateHostSlotsActivity(
  input: RegenerateHostSlotsInput,
) {
  await runSlotGeneration(input);
}

export async function sendBookingConfirmationEmailActivity(bookingId: number) {
  await sendBookingConfirmationEmail(bookingId);
}

export async function createGoogleCalendarEventActivity(bookingId: number) {
  if (!isProjectCalendarConfigured()) {
    console.warn(
      "[temporal] Google Calendar not configured, skipping event creation",
    );
    return;
  }

  const result = await createGoogleCalendarEvent(bookingId);

  await updateBookingCalendarDetails(bookingId, {
    meetLink: result.meetLink,
    calendarEventId: result.calendarEventId,
  });
}
