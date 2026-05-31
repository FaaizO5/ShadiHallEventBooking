import { z } from "zod";
import { isWithinBookingWindow } from "./dates";

// Registration: email + password (email is the unique account identifier, FR-013).
export const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().min(1).max(100).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// Slot enum mirrors the Prisma `Slot` enum.
export const slotSchema = z.enum(["DAY", "NIGHT"]);
export type Slot = z.infer<typeof slotSchema>;

// Booking request input. Date must be a valid date within today..+12 months (FR-008).
export const bookingInputSchema = z.object({
  hallId: z.string().min(1),
  date: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date")
    .refine(isWithinBookingWindow, "Date must be between today and 12 months from now"),
  slot: slotSchema,
});
export type BookingInput = z.infer<typeof bookingInputSchema>;

// Hall create/edit input (admin only, FR-019).
export const hallInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().min(1, "Description is required"),
  capacity: z.coerce.number().int().positive("Capacity must be a positive number"),
  images: z.array(z.string().url("Each image must be a valid URL")).default([]),
  featured: z.coerce.boolean().default(false),
});
export type HallInput = z.infer<typeof hallInputSchema>;
