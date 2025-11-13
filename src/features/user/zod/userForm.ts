import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(1, "Email is required"),
  phone: z.string().optional(),
  position: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  groupId: z.string().min(1, "User Group is required"),
});

export type UserFormData = z.infer<typeof userFormSchema>;