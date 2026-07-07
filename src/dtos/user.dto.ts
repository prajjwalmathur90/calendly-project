import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email("Invalid Email Address"),
  name: z
    .string()
    .min(1, "Name is Required")
    .max(100, "Name must be less than 100 characters"),
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

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
