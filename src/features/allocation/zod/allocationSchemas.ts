import { z } from "zod";
import type { AllocationActionPayload, AllocationSelection, AllocationType, RentalPayload } from "../types";
import { toIsoString } from "../utils/formatters";

// ============================================================================
// Date Range Validation
// ============================================================================

const validateDateRange = (
  value: { startDate: Date; endDate?: Date },
  ctx: z.RefinementCtx
) => {
  if (value.endDate && value.endDate.getTime() < value.startDate.getTime()) {
    ctx.addIssue({
      code: "custom",
      message: "End date cannot be before start date.",
      path: ["endDate"],
    });
  }
};

// ============================================================================
// Schemas
// ============================================================================

const locationAllocationSchema = z.object({
  allocationType: z.literal("location"),
  targetLocation: z.string(),
  assets: z.array(z.object({
    assetId: z.string(),
    assetName: z.string(),
    requestedQuantity: z.number(),
    availableQuantity: z.number(),
  })),
  notes: z.string().optional(),
});

const userAssignmentSchema = z
  .object({
    allocationType: z.literal("user"),
    targetUser: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    assets: z.array(z.object({
      assetId: z.string(),
      assetName: z.string(),
      requestedQuantity: z.number(),
      availableQuantity: z.number(),
    })),
    notes: z.string().optional(),
  })
  .superRefine(validateDateRange);

export const allocationFormSchema = z.discriminatedUnion("allocationType", [
  locationAllocationSchema,
  userAssignmentSchema,
]);

const rentalFormSchema = z
  .object({
    assetIds: z.array(z.string()),
    customerName: z.string(),
    rentAmount: z.number(),
    startDate: z.date(),
    endDate: z.date().optional(),
    notes: z.string().optional(),
  })
  .superRefine(validateDateRange);

export type AllocationFormData = z.infer<typeof allocationFormSchema>;
export type RentalFormData = z.infer<typeof rentalFormSchema>;

// ============================================================================
// Validation
// ============================================================================

interface ValidationResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const validateAllocationForm = (
  allocationType: AllocationType | null,
  targetLocation: string,
  targetUser: string,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  notes: string,
  assets: AllocationSelection[]
): ValidationResult<AllocationFormData> => {
  if (!allocationType) {
    return { success: false, message: "" };
  }

  const trimmedNotes = notes.trim() || undefined;

  if (allocationType === "location") {
    const result = allocationFormSchema.safeParse({
      allocationType: "location" as const,
      targetLocation: targetLocation.trim(),
      assets,
      notes: trimmedNotes,
    });

    return result.success
      ? { success: true, message: "", data: result.data }
      : { success: false, message: result.error.issues[0]?.message ?? "" };
  }

  if (!startDate) {
    return { success: false, message: "Start date is required." };
  }

  const result = allocationFormSchema.safeParse({
    allocationType: "user" as const,
    targetUser: targetUser.trim(),
    startDate,
    endDate: endDate ?? undefined,
    assets,
    notes: trimmedNotes,
  });

  return result.success
    ? { success: true, message: "", data: result.data }
    : { success: false, message: result.error.issues[0]?.message ?? "" };
};

export const validateRentalForm = (
  assetIds: string[],
  customerName: string,
  rentAmount: number,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  notes: string
): ValidationResult<RentalFormData> => {
  if (!startDate) {
    return { success: false, message: "Start date is required." };
  }

  const result = rentalFormSchema.safeParse({
    assetIds,
    customerName: customerName.trim(),
    rentAmount,
    startDate,
    endDate: endDate ?? undefined,
    notes: notes.trim() || undefined,
  });

  return result.success
    ? { success: true, message: "", data: result.data }
    : { success: false, message: result.error.issues[0]?.message ?? "" };
};

// ============================================================================
// Payload Builders
// ============================================================================

export const buildAllocationPayload = (
  data: AllocationFormData
): AllocationActionPayload => ({
  type: data.allocationType,
  targetLocation: data.allocationType === "location" ? data.targetLocation : undefined,
  targetUser: data.allocationType === "user" ? data.targetUser : undefined,
  startDate: data.allocationType === "user" ? toIsoString(data.startDate) : undefined,
  endDate: data.allocationType === "user" ? toIsoString(data.endDate) : undefined,
  notes: data.notes,
  assets: data.assets,
});

export const buildRentalPayload = (data: RentalFormData): RentalPayload => ({
  assetIds: data.assetIds,
  customerName: data.customerName,
  rentAmount: data.rentAmount,
  startDate: toIsoString(data.startDate) ?? "",
  endDate: toIsoString(data.endDate),
  notes: data.notes,
});
