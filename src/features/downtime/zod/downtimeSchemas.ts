import { z } from "zod";

/**
 * Schema for creating a new downtime incident
 */
export const createDowntimeSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startTime: z.string().datetime("Invalid date format"),
  endTime: z.string().datetime("Invalid date format").optional(),
  reportedBy: z.string().optional(),
}).refine(
  (data) => {
    if (data.endTime && data.startTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

/**
 * Schema for editing an existing downtime incident
 */
export const editDowntimeSchema = z.object({
  id: z.string().min(1, "Incident ID is required"),
  assetId: z.string().min(1, "Asset is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  status: z.enum(["Down", "Resolved"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startTime: z.string().datetime("Invalid date format"),
  endTime: z.string().datetime("Invalid date format").optional(),
  reportedBy: z.string().optional(),
  resolvedBy: z.string().optional(),
  resolutionNotes: z.string().optional(),
}).refine(
  (data) => {
    if (data.status === "Resolved" && !data.endTime) {
      return false;
    }
    return true;
  },
  {
    message: "End time is required when status is Resolved",
    path: ["endTime"],
  }
).refine(
  (data) => {
    if (data.status === "Resolved" && !data.resolutionNotes) {
      return false;
    }
    return true;
  },
  {
    message: "Resolution notes are required when status is Resolved",
    path: ["resolutionNotes"],
  }
).refine(
  (data) => {
    if (data.endTime && data.startTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

/**
 * Schema for resolving a downtime incident
 */
export const resolveDowntimeSchema = z.object({
  id: z.string().min(1, "Incident ID is required"),
  endTime: z.string().datetime("Invalid date format"),
  resolvedBy: z.string().min(1, "Resolver name is required"),
  resolutionNotes: z.string().min(10, "Resolution notes must be at least 10 characters"),
});

/**
 * Type exports from schemas
 */
export type CreateDowntimeInput = z.infer<typeof createDowntimeSchema>;
export type EditDowntimeInput = z.infer<typeof editDowntimeSchema>;
export type ResolveDowntimeInput = z.infer<typeof resolveDowntimeSchema>;
