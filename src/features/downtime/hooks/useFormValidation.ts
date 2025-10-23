import { useState, useCallback } from "react";
import { z } from "zod";

interface UseFormValidationProps<T> {
  initialValues: T;
  validationSchema: z.ZodType<T>;
  onSubmit: (data: T) => void;
}

interface UseFormValidationReturn<T> {
  formData: T;
  errors: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  clearError: (field: string) => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
}

export function useFormValidation<T>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormValidationProps<T>): UseFormValidationReturn<T> {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validationSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setErrors({});
      onSubmit(validation.data);
    },
    [formData, validationSchema, onSubmit]
  );

  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues]);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field as string);
  }, [clearError]);

  return {
    formData,
    errors,
    setFormData,
    setErrors,
    handleSubmit,
    resetForm,
    clearError,
    updateField,
  };
}
