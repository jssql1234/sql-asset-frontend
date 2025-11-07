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
  cost: z.string().optional(),
  description: z.string().optional(),
  purchaseDate: z.string().optional(),
  acquireDate: z.string().min(1, "This Date is required"),

  // Allowance tab
  taxYear: z.string().optional(),
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
  selfUsePercentage: z.string().optional(),
  rentedApportionPercentage: z.string().optional(),
  manualQE: z.boolean().optional(),
  
  // Depreciation tab
  depreciationMethod: z.string(),
  depreciationFrequency: z.string(),
  usefulLife: z.number().min(1),
  residualValue: z.string().optional(),
  depreciationRate: z.string().optional(),
  totalDepreciation: z.string().optional(),

  // Allocation tab
  branch: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  personInCharge: z.string().optional(),
  allocationNotes: z.string().optional(),

  // Serial No tab
  serialNumbers: z.array(z.object({
    serial: z.string(),
    remark: z.string(),
  })),

  // Hire Purchase tab
  hpStartDate: z.string().optional(),
  hpInstalment: z.string().optional(),
  hpInstalmentUser: z.string().optional(),
  hpDeposit: z.string().optional(),
  hpInterest: z.number().optional(),
  hpFinance: z.string().optional(),

  // Warranty tab
  warrantyProvider: z.string().optional(),
  warrantyStartDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
  warrantyNotes: z.string().optional(),
});

export type CreateAssetFormData = z.infer<typeof createAssetFormSchema>;
