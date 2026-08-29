import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(200)
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a digit"),
  village: z.string().trim().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const reportSchema = z.object({
  waterPointId: z.string().cuid(),
  issueType: z.enum([
    "NO_WATER",
    "LOW_PRESSURE",
    "CONTAMINATION_CONCERN",
    "PHYSICAL_DAMAGE",
    "VANDALISM",
    "OTHER",
  ]),
  description: z.string().trim().min(10, "Please describe the issue in more detail").max(2000),
  reporterName: z.string().trim().max(100).optional(),
});

export const reportStatusUpdateSchema = z.object({
  status: z.enum(["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "DISMISSED"]),
  resolutionNotes: z.string().trim().max(2000).optional(),
});

export const waterPointStatusUpdateSchema = z.object({
  status: z.enum([
    "AVAILABLE",
    "PARTIALLY_AVAILABLE",
    "REPORTED_UNAVAILABLE",
    "UNDER_MAINTENANCE",
    "NEEDS_VERIFICATION",
  ]),
});

export const maintenanceLogSchema = z.object({
  waterPointId: z.string().cuid(),
  action: z.string().trim().min(3).max(200),
  notes: z.string().trim().max(2000).optional(),
});

export const userRoleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "CARETAKER", "MEMBER"]),
});

export const waterPointQuerySchema = z.object({
  status: z
    .enum([
      "AVAILABLE",
      "PARTIALLY_AVAILABLE",
      "REPORTED_UNAVAILABLE",
      "UNDER_MAINTENANCE",
      "NEEDS_VERIFICATION",
    ])
    .optional(),
  type: z
    .enum(["BOREHOLE", "SHALLOW_WELL", "PROTECTED_SPRING", "TAP_STAND", "RAINWATER_HARVESTING"])
    .optional(),
  village: z.string().trim().max(100).optional(),
  q: z.string().trim().max(200).optional(),
});
