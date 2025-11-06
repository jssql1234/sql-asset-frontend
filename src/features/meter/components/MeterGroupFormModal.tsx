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

type MeterGroupFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  onSave: (groupId: string | undefined, name: string, description: string) => void;
};

export const MeterGroupFormModal = ({
  open,
  onOpenChange,
  group,
  onSave,
}: MeterGroupFormModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = !!group;

  // Reset/populate form when modal opens or group changes
  useEffect(() => {
    if (open) {
      if (group) {
        setName(group.name);
        setDescription(group.description || "");
      } else {
        setName("");
        setDescription("");
      }
      setFormError(null);
    }
  }, [open, group]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setFormError("Group name is required");
      return;
    }

    onSave(
      group?.id,
      name.trim(),
      description.trim()
    );
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
    } else {
      setName("");
      setDescription("");
    }
    setFormError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl min-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit meter group" : "Create meter group"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Group name <span className="text-error">*</span>
            </label>
            <Input
              value={name}
              placeholder="e.g. Plant Utilities"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setName(event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">Description</label>
            <TextArea
              rows={4}
              placeholder="Summary that explains what this meter group is tracking"
              value={description}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(event.target.value)
              }
            />
          </div>
          {formError ? <p className="text-sm text-error">{formError}</p> : null}
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim()}>
              {isEditMode ? "Save Changes" : "Create group"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeterGroupFormModal;
