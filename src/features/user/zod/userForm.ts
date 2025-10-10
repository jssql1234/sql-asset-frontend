import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(1, "Email is required"),
  phone: z.string().optional(),
  position: z.string().optional(), // Position/Title
  department: z.string().optional(),
  location: z.string().optional(), // Primary Location
  groupId: z.string().min(1, "User Group is required"),
});

export type UserFormData = z.infer<typeof userFormSchema>;