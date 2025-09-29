import { useRef } from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "./Dialog";
import { Button } from "@/components/ui/components";
import { useToast } from "@/components/ui/components/Toast/useToast";
import CreateAsset from "./CreateAsset";
import type { CreateAssetFormData } from "../zod/createAssetForm";

interface CreateAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreateAssetRef {
  submit: () => void;
}

export default function CreateAssetModal({ open, onOpenChange }: CreateAssetModalProps) {
  const { addToast } = useToast();
  const createAssetRef = useRef<CreateAssetRef>(null);

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
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto flex flex-col bg-onPrimary py-0" dialogClose={false}>
        <DialogHeader className="sticky z-99 top-0 flex flex-row items-center bg-onPrimary py-6 mb-4 border-b border-outline">
          <DialogTitle className="title-medium text-onSurface m-0">Create Asset</DialogTitle>
          <DialogClose className="static"/>
        </DialogHeader>

        <div className="flex-grow">
          <CreateAsset ref={createAssetRef} onSuccess={handleSuccess} />
        </div>

        <div className="sticky bottom-0 bg-onPrimary p-4 flex gap-6 justify-end border-t border-outline">
          <Button onClick={handleFakeSubmit} disabled={isSubmitting} className="bg-warning text-onWarning rounded-md hover:bg-warning/80">{isSubmitting ? "Creating..." : "Fake Submit (Test)"}</Button>
          <Button onClick={() => createAssetRef.current?.submit()}>Create Asset</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}