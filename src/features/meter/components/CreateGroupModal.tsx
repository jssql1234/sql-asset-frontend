import { type ChangeEvent, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import type { MeterGroupInput } from "@/types/meter";

type CreateGroupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: MeterGroupInput) => void;
};

export const CreateGroupModal = ({
  open,
  onOpenChange,
  onSave,
}: CreateGroupModalProps) => {
  const [groupForm, setGroupForm] = useState<MeterGroupInput>({
    name: "",
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setGroupForm({ name: "", description: "" });
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!groupForm.name.trim()) {
      setFormError("Group name is required");
      return;
    }

    onSave({
      name: groupForm.name.trim(),
      description: groupForm.description?.trim() || "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl min-w-2xl">
        <DialogHeader>
          <DialogTitle>Create meter group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">Group name</label>
            <Input
              value={groupForm.name}
              placeholder="e.g. Plant Utilities"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setGroupForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">Description</label>
            <TextArea
              rows={4}
              placeholder="Summary that explains what this meter group is tracking"
              value={groupForm.description}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setGroupForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </div>
          {formError ? <p className="text-sm text-error">{formError}</p> : null}
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create group</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
