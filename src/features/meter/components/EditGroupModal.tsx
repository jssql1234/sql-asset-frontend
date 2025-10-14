import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input";

interface EditGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    id: string;
    name: string;
    description?: string;
  } | null;
  onSave: (groupId: string, name: string, description: string) => void;
}

const EditGroupModal = ({
  open,
  onOpenChange,
  group,
  onSave,
}: EditGroupModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
    }
  }, [group]);

  const handleSave = () => {
    if (group && name.trim()) {
      onSave(group.id, name.trim(), description.trim());
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setName(group?.name || "");
    setDescription(group?.description || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md min-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Group Name</DialogTitle>

        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="group-name"
              className="block text-sm font-medium text-onSurface mb-1"
            >
              Name<span className="text-red-500">*</span>
            </label>
            <Input
              id="group-name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Enter group name"
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="group-description"
              className="block text-sm font-medium text-onSurface mb-1"
            >
              Description
            </label>
            <TextArea
              id="group-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Enter group description (optional)"
              className="w-full min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupModal;
