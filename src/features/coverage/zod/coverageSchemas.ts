import { z } from "zod";

// Insurance Policy Schema
const baseInsuranceFields = {
  name: z.string().min(1, "Policy name is required"),
  provider: z.string().min(1, "Insurance provider is required"),
  policyNumber: z.string().min(1, "Policy number is required"),
  coverageAmount: z.number().min(0, "Coverage amount must be positive"),
  remainingCoverage: z.number().min(0, "Remaining coverage must be positive"),
  annualPremium: z.number().min(0, "Annual premium must be positive"),
  limitType: z.enum(["Aggregate", "Per Occurrence"]),
  startDate: z.iso.datetime(),
  expiryDate: z.iso.datetime(),
  assetsCovered: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ).min(1, "Select at least one asset"),
  description: z.string().min(1, "Description is required"),
} as const;

export const createInsuranceSchema = z.object(baseInsuranceFields).superRefine((data, ctx) => {
  if (data.remainingCoverage > data.coverageAmount) {
    ctx.addIssue({
      code: "custom",
      message: "Remaining coverage cannot exceed total coverage amount",
      path: ["remainingCoverage"],
    });
  }
  
  const startDate = new Date(data.startDate);
  const expiryDate = new Date(data.expiryDate);
  
  if (expiryDate <= startDate) {
    ctx.addIssue({
      code: "custom",
      message: "Expiry date must be after start date",
      path: ["expiryDate"],
    });
  }
});

export const updateInsuranceSchema = createInsuranceSchema;

// Warranty Schema
const baseWarrantyFields = {
  name: z.string().min(1, "Warranty name is required"),
  provider: z.string().min(1, "Provider is required"),
  warrantyNumber: z.string().min(1, "Warranty number is required"),
  coverage: z.string().min(1, "Coverage type is required"),
  expiryDate: z.iso.datetime(),
  assetsCovered: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ).min(1, "Select at least one asset"),
  description: z.string().min(1, "Description is required"),
} as const;

export const createWarrantySchema = z.object(baseWarrantyFields);
export const updateWarrantySchema = createWarrantySchema;

// Claim Schema
const baseClaimFields = {
  claimNumber: z.string().min(1, "Claim number is required"),
  type: z.enum(["Insurance", "Warranty"]),
  referenceId: z.string().min(1, "Select a policy or warranty"),
  referenceName: z.string().min(1, "Reference name is required"),
  assets: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ).min(1, "Select at least one asset"),
  amount: z.number().min(0.01, "Claim amount must be greater than zero"),
  status: z.enum(["Filed", "Rejected", "Settled", "Approved"]),
  dateFiled: z.iso.datetime(),
  workOrderId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
} as const;

export const createClaimSchema = z.object(baseClaimFields);
export const updateClaimSchema = createClaimSchema;

// Type exports
export type CreateInsuranceInput = z.infer<typeof createInsuranceSchema>;
export type UpdateInsuranceInput = z.infer<typeof updateInsuranceSchema>;
export type CreateWarrantyInput = z.infer<typeof createWarrantySchema>;
export type UpdateWarrantyInput = z.infer<typeof updateWarrantySchema>;
export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
