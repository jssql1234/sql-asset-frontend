import { z } from "zod";

export const createAssetFormSchema = z.object({
  // Main form fields
  inactive: z.boolean(),
  inactiveStart: z.string().optional(),
  inactiveEnd: z.string().optional(),
  batchID: z.string().optional(),
  code: z.string().min(1, "Asset ID is required"),
  assetGroup: z.string().min(1, "Asset Group is required"),
  assetName: z.string().min(1, "Asset Name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  quantityPerUnit: z.number().min(1, "Quantity per Asset must be at least 1"),
  cost: z.string().min(1, "Cost is required"),
  description: z.string().optional(),
  purchaseDate: z.string().optional(),
  acquireDate: z.string().optional(),

  // Allowance tab
  caAssetGroup: z.string().optional(),
  allowanceClass: z.string().optional(),
  subClass: z.string().optional(),
  iaRate: z.string().optional(),
  aaRate: z.string().optional(),
  aca: z.boolean(),
  extraCheckbox: z.boolean(),
  extraCommercial: z.boolean(),
  extraNewVehicle: z.boolean(),
  qeValue: z.string().optional(),
  residualExpenditure: z.string().optional(),
  ownUseValue: z.string().optional(),
  ibApportionValue: z.string().optional(),
  agriAa: z.string().optional(),

  // Depreciation tab
  depreciationMethod: z.string(),
  depreciationFrequency: z.string(),
  usefulLife: z.number().min(1),
  residualValue: z.string().optional(),
  depreciationRate: z.string().optional(),
  totalDepreciation: z.string().optional(),

  // Disposal tab (simplified)
  disposalAssetCode: z.string().optional(),
  disposalAssetDescription: z.string().optional(),
  disposalOriginalCost: z.number().optional(),
  disposalQualifyingExpenditure: z.number().optional(),
  disposalResidualExpenditure: z.number().optional(),
  disposalTotalCaClaimed: z.number().optional(),
  disposalPurchaseDate: z.string().optional(),
  disposalDisposalDate: z.string().optional(),
  disposalType: z.string().optional(),

  // Allocation tab
  branch: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  personInCharge: z.string().optional(),
  allocationNotes: z.string().optional(),

  // Serial No tab
  serialNumbers: z.array(z.string()),

  // Warranty tab
  warrantyProvider: z.string().optional(),
  warrantyStartDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
  warrantyNotes: z.string().optional(),
});

export type CreateAssetFormData = z.infer<typeof createAssetFormSchema>;
