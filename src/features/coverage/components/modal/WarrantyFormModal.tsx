import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import type { CoverageWarranty } from "@/features/coverage/types";

interface WarrantyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers?: string[];
  initialWarranty?: CoverageWarranty;
}

export const WarrantyFormModal: React.FC<WarrantyFormModalProps> = ({
  open,
  onOpenChange,
  providers = [],
  initialWarranty,
}) => {
  const isEditing = Boolean(initialWarranty);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Warranty" : "Add Warranty"}</DialogTitle>
          <DialogDescription>
            Register manufacturer warranty coverage for critical equipment. Integration hooks for asset assignment will be configured later.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            onOpenChange(false);
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Warranty Name *</label>
              <Input defaultValue={initialWarranty?.name} placeholder="e.g. Robotics Extended Care" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Provider *</label>
              <Input defaultValue={initialWarranty?.provider} list="warranty-provider-suggestions" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Warranty Number *</label>
              <Input defaultValue={initialWarranty?.warrantyNumber} placeholder="e.g. OMNI-PR-2201" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Coverage Type *</label>
              <Input
                defaultValue={initialWarranty?.coverage}
                placeholder="Parts, Labour, or Full Coverage"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Start Date *</label>
              <Input type="date" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="body-small text-onSurface">Expiry Date *</label>
              <Input type="date" defaultValue={initialWarranty?.expiryDate} />
            </div>
          </div>

          {providers.length > 0 && (
            <datalist id="warranty-provider-suggestions">
              {providers.map((provider) => (
                <option key={provider} value={provider} />
              ))}
            </datalist>
          )}

          <div className="flex flex-col gap-2">
            <label className="body-small text-onSurface">Description</label>
            <TextArea
              rows={3}
              placeholder="Important clauses, limitations, service windows, etc."
              defaultValue={initialWarranty?.description}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="body-small text-onSurface">Assets Covered</label>
              <Button variant="outline" size="sm">
                Manage Assets
              </Button>
            </div>
            <Input placeholder="Search assets by name or ID" disabled />
            <div className="min-h-[80px] rounded-md border border-outline flex flex-wrap gap-2 p-3 bg-surfaceContainer">
              {initialWarranty?.assetsCovered.length ? (
                initialWarranty.assetsCovered.map((asset) => (
                  <span
                    key={asset.id}
                    className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 body-small text-primary"
                  >
                    {asset.name}
                  </span>
                ))
              ) : (
                <span className="body-small text-onSurfaceVariant">
                  Asset linking experience will be powered by future asset directory hooks.
                </span>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
