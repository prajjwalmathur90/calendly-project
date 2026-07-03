import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email("Invalid Email Address"),
  name: z
    .string()
    .min(1, "Name is Required")
    .max(100, "Name must be less than 100 characters"),
});

export const updateUserNameSchema = z.object({
  name: z
    .string()
    .min(1, "Name is Required")
    .max(100, "Name must be less than 100 characters"),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserNameDto = z.infer<typeof updateUserNameSchema>;
