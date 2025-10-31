import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/components";

interface FormSection {
  title: string;
  content: ReactNode;
}

interface BaseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  sections: FormSection[];
  onSubmit: (event: React.FormEvent) => void;
  isEditing?: boolean;
}

export const BaseFormModal = ({
  open,
  onOpenChange,
  title,
  description,
  sections,
  onSubmit,
}: BaseFormModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto">
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            {sections.map((section) => (
              <div key={section.title} className="space-y-4 bg-surfaceContainer">
                <div className="space-y-1">
                  <h3 className="title-small font-semibold text-onSurface">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-3">{section.content}</div>
              </div>
            ))}
          </form>
        </div>

        <DialogFooter className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={onSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
