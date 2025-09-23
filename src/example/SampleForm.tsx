import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { type TFormSchema, formSchema } from "./zod/exampleForm.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/components";
import { FileInput } from "@/components/ui/components/Input";

export const SampleForm = () => {
  const {
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    mode: "all",
  });

  const fakeApiCall = () => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const shouldFail = Math.random() < 0.5;
        shouldFail ? reject("API error occurred") : resolve();
      }, 1000);
    });
  };

  const onSubmit: SubmitHandler<TFormSchema> = async () => {
    try {
      await fakeApiCall(); 
      alert("Submitted succesfuly");
    } catch (error: Error) {
      setError("files", {});
      setError("files", { message: "fail submit file" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-6">
        <Controller
          name="files"
          control={control}
          render={({ field }) => (
            <FileInput
              {...field}
              label="File"
              type="file"
              fileHint="File size must be less than 2MB and must be in jpg, png, jpeg format"
              accept="image/*"
              multiple
              value={undefined}
              onFilesChange={field.onChange}
              errorMsg={
                errors.files?.message?.toString() ||
                errors.root?.message?.toString()
              }
            />
          )}
        />
        <Button
          disabled={isSubmitting}
          type="submit"
          className="{disabled: isSubmitting} w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
};
