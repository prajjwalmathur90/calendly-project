import { z } from "zod";

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  durationMinutes: z
    .number()
    .int("Duration must be an integer")
    .positive("Duration must be greater than 0"),

  isActive: z.boolean().optional(),

  locationType: z
    .string()
    .min(1, "Location type is required")
    .max(100, "Location type must be less than 100 characters")
    .optional(),

  locationValue: z
    .string()
    .max(255, "Location value must be less than 255 characters")
    .optional(),

  bufferBeforeMinutes: z
    .number()
    .int("Buffer Before Minutes must be an integer")
    .min(0, "Buffer Before Minutes cannot be negative"),

  bufferAfterMinutes: z
    .number()
    .int("Buffer After Minutes must be an integer")
    .min(0, "Buffer After Minutes cannot be negative"),

  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug may only contain lowercase letters, numbers, and hyphens",
    )
    .optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();

export type UpdateEventDto = z.infer<typeof updateEventSchema>;
