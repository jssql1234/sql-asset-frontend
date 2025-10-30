import { z } from "zod";

export const earlySettlementFormSchema = z.object({
  selectedMonth: z.number().min(1, "Please select a settlement month."),
  interestAmount: z
    .string()
    .min(1, "Settlement interest amount is required.")
    .refine(
      (val) => !isNaN(Number(val)),
      "Settlement interest amount must be a valid number."
    )
    .refine(
      (val) => Number(val) >= 0,
      "Settlement interest amount cannot be negative."
    ),
});

export type EarlySettlementFormData = z.infer<typeof earlySettlementFormSchema>;