import { z } from "zod";

export const formSchema = z.object({
  files: z
    .instanceof(FileList, {message : `At least one file is required`})
    .refine((val) => val.length > 0, {
      message: "At least one file is required",
    })
    .refine((val) => val.length <= 5, {
      message: "Maximum  files are allowed",
    })
    .refine(
      (val) =>
        Array.from(val).every((file) => file.type.startsWith("image/")),
      {
        message: "Only image files are allowed",
      }
    ),
});

export type TFormSchema = z.infer<typeof formSchema>;
