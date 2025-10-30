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

interface DowntimeConsistencyFields {
  status: "Down" | "Resolved";
  description?: string | null;
  resolutionNotes?: string | null;
  startTime: string;
  endTime?: string | null;
}

const validateDowntimeConsistency = <T extends z.ZodType>(schema: T) =>
  schema.superRefine((rawData, ctx) => {
    const data = rawData as DowntimeConsistencyFields;
    const isResolved = data.status === "Resolved";
    const trimmedDescription = data.description?.trim();
    const trimmedResolution = data.resolutionNotes?.trim();

    if (!isResolved && !trimmedDescription) {
      ctx.addIssue({
        code: "custom",
        message: "Description is required when status is Down",
        path: ["description"],
      });
    }

    if (isResolved) {
      if (!data.endTime) {
        ctx.addIssue({
          code: "custom",
          message: "End time is required when status is Resolved",
          path: ["endTime"],
        });
      }

      if (!trimmedResolution) {
        ctx.addIssue({
          code: "custom",
          message: "Resolution notes are required when status is Resolved",
          path: ["resolutionNotes"],
        });
      }
    }

    if (data.endTime && new Date(data.endTime) <= new Date(data.startTime)) {
      ctx.addIssue({
        code: "custom",
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });

// Schema for creating a new downtime incident
export const createDowntimeSchema = validateDowntimeConsistency(
  z.object({
    ...baseDowntimeFields,
    reportedBy: z.string().optional(),
  })
);

// Schema for editing an existing downtime incident
export const editDowntimeSchema = validateDowntimeConsistency(
  z.object({
    id: z.string().min(1, "Incident ID is required"),
    ...baseDowntimeFields,
    reportedBy: z.string().optional(),
    resolvedBy: z.string().optional(),
  })
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
