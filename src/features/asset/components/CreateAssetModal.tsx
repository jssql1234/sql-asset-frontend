import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/components";
import { useToast } from "@/components/ui/components/Toast/useToast";
import CreateAsset from "./CreateAsset";
import type { CreateAssetFormData } from "../zod/createAssetForm";

interface CreateAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAssetModal({ open, onOpenChange }: CreateAssetModalProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = (data: CreateAssetFormData) => {
    console.log("Asset created successfully:", data);
    addToast({
      variant: "success",
      title: "Asset Created",
      description: `Asset "${data.assetName}" has been created successfully.`,
      duration: 5000,
    });
    onOpenChange(false);
  };

  const handleFakeSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      addToast({
        variant: "success",
        title: "Asset Created (Fake)",
        description: "This is a fake submission for testing purposes.",
        duration: 5000,
      });
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="title-medium text-onSurface">Create Asset</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="mt-4">
          <CreateAsset onSuccess={handleSuccess} />

          {/* Fake submit button for testing */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleFakeSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-warning text-onWarning rounded-md hover:bg-warning/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Fake Submit (Test)"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}