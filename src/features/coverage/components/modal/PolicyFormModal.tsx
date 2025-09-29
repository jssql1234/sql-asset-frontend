import React, { useMemo } from "react";
import { Button, Card, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { TextArea } from "@/components/ui/components/Input/TextArea";
import type { CoveragePolicy } from "@/features/coverage/types";

interface PolicyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers?: string[];
  initialPolicy?: CoveragePolicy;
}

export const PolicyFormModal: React.FC<PolicyFormModalProps> = ({
  open,
  onOpenChange,
  providers = [],
  initialPolicy,
}) => {
  const isEditing = Boolean(initialPolicy);

  const headerTitle = isEditing ? "Edit Insurance Policy" : "Add Insurance Policy";

  const providerSuggestions = useMemo(() => {
    if (providers.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 body-small text-onSurfaceVariant">
        {providers.map((provider) => (
          <span key={provider} className="px-2 py-1 rounded-full bg-secondaryContainer">
            {provider}
          </span>
        ))}
      </div>
    );
  }, [providers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{headerTitle}</DialogTitle>
          <DialogDescription>
            Capture policy coverage details, premiums, and associated assets. Workflow orchestration will be added later.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            onOpenChange(false);
          }}
        >
          <Card className="space-y-4 border border-outline bg-surfaceContainer">
            <div className="space-y-1">
              <h3 className="title-small font-semibold text-onSurface">Policy Details</h3>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Policy Name *</label>
                  <Input
                    defaultValue={initialPolicy?.name}
                    placeholder="e.g. Comprehensive Equipment Protection"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Insurance Provider *</label>
                  <Input
                    defaultValue={initialPolicy?.provider}
                    placeholder="Enter provider name"
                    list="policy-provider-suggestions"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Policy Number *</label>
                  <Input defaultValue={initialPolicy?.policyNumber} placeholder="e.g. AIB-CEQ-2025-01" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Annual Premium *</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={initialPolicy?.annualPremium}
                    placeholder="Enter annual premium"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Coverage Amount *</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={initialPolicy?.coverageAmount}
                    placeholder="Enter coverage amount"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Remaining Coverage</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={initialPolicy?.remainingCoverage}
                    placeholder="Auto calculated"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Start Date *</label>
                  <Input type="date" defaultValue={initialPolicy?.startDate} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="body-small text-onSurface">Expiry Date *</label>
                  <Input type="date" defaultValue={initialPolicy?.expiryDate} />
                </div>
              </div>
              {providerSuggestions}
            </div>
          </Card>

          {providers.length > 0 && (
            <datalist id="policy-provider-suggestions">
              {providers.map((provider) => (
                <option key={provider} value={provider} />
              ))}
            </datalist>
          )}

          <Card className="space-y-4 border border-outline bg-surfaceContainer">
            <div className="space-y-1">
              <h3 className="title-small font-semibold text-onSurface">Additional Notes</h3>
            </div>
            <div className="space-y-3">
              <TextArea
                rows={3}
                placeholder="Provide additional coverage notes, deductibles, or asset-specific clauses"
                defaultValue={initialPolicy?.description}
              />
            </div>
          </Card>

          <Card className="space-y-4 border border-outline bg-surfaceContainer">
            <div className="space-y-1">
              <h3 className="title-small font-semibold text-onSurface">Assets Covered</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="body-small text-onSurface">Linked Assets</label>
                <Button variant="outline" size="sm">
                  Manage Assets
                </Button>
              </div>
              <Input placeholder="Search assets by name or ID" disabled />
              <div className="min-h-[96px] rounded-md border border-outline flex flex-wrap gap-2 p-3 bg-surfaceContainer">
                {initialPolicy?.assetsCovered?.length ? (
                  initialPolicy.assetsCovered.map((asset) => (
                    <span
                      key={asset.id}
                      className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 body-small text-primary"
                    >
                      {asset.name}
                    </span>
                  ))
                ) : (
                  <span className="body-small text-onSurfaceVariant">
                    Asset selection will be implemented with inventory lookup hooks.
                  </span>
                )}
              </div>
            </div>
          </Card>

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
