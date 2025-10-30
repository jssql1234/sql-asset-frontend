import { z } from "zod";

// Shared base fields for downtime incidents
const baseDowntimeFields = {
  assetIds: z.array(z.string().min(1, "Asset is required")).min(1, "Select at least one asset"),
  priority: z.enum(["Low", "High", "Critical"]),
  status: z.enum(["Down", "Resolved"]),
  description: z.string().optional(),
  startTime: z.iso.datetime({ message: "Invalid date format" }),
  endTime: z.iso.datetime({ message: "Invalid date format" }).optional(),
  resolutionNotes: z.string().optional(),
} as const;

// Schema for creating a new downtime incident
export const createDowntimeSchema = z
  .object({
    ...baseDowntimeFields,
    reportedBy: z.string().optional(),
  })
  .refine(
    (data) => data.status !== "Resolved" || Boolean(data.description?.trim()),
    {
      message: "Description is required when status is not Resolved",
      path: ["description"],
    }
  )
  .refine((data) => data.status !== "Resolved" || Boolean(data.endTime), {
    message: "End time is required when status is Resolved",
    path: ["endTime"],
  })
  .refine(
    (data) => data.status !== "Resolved" || Boolean(data.resolutionNotes?.trim()),
    {
      message: "Resolution notes are required when status is Resolved",
      path: ["resolutionNotes"],
    }
  )
  .refine(
    (data) => !data.endTime || new Date(data.endTime) > new Date(data.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// Schema for editing an existing downtime incident
export const editDowntimeSchema = z
  .object({
    id: z.string().min(1, "Incident ID is required"),
    ...baseDowntimeFields,
    reportedBy: z.string().optional(),
    resolvedBy: z.string().optional(),
  })
  .refine(
    (data) => data.status !== "Resolved" || Boolean(data.description?.trim()),
    {
      message: "Description is required when status is not Resolved",
      path: ["description"],
    }
  )
  .refine((data) => data.status !== "Resolved" || Boolean(data.endTime), {
    message: "End time is required when status is Resolved",
    path: ["endTime"],
  })
  .refine(
    (data) => data.status !== "Resolved" || Boolean(data.resolutionNotes?.trim()),
    {
      message: "Resolution notes are required when status is Resolved",
      path: ["resolutionNotes"],
    }
  )
  .refine(
    (data) => !data.endTime || new Date(data.endTime) > new Date(data.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// Schema for resolving a downtime incident
export const resolveDowntimeSchema = z.object({
  id: z.string().min(1, "Incident ID is required"),
  endTime: z.iso.datetime({ message: "Invalid date format" }),
  resolvedBy: z.string().min(1, "Resolver name is required"),
  resolutionNotes: z.string().min(10, "Resolution notes must be at least 10 characters"),
});

// Type exports from schemas
export type CreateDowntimeInput = z.infer<typeof createDowntimeSchema>;
export type EditDowntimeInput = z.infer<typeof editDowntimeSchema>;
export type ResolveDowntimeInput = z.infer<typeof resolveDowntimeSchema>;
