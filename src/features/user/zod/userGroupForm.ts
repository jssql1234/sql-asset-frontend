import { z } from "zod";

export const userGroupFormSchema = z.object({
  id: z.string().min(1, "Group ID is required").regex(/^[a-zA-Z0-9_-]+$/, "Group ID can only contain letters, numbers, hyphens, and underscores"),
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

export type UserGroupFormData = z.infer<typeof userGroupFormSchema>;