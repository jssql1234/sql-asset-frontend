import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/components";
import { Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [returnType, setReturnType] = useState<
    "location-return" | "user-return" | ""
  >("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");

  const resetModal = () => {
    setReturnType("");
    setSource("");
    setNotes("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = () => {
    // Logic to return assets
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-surface">
        <DialogHeader className="border-b border-outline pb-4">
          <DialogTitle className="title-medium text-onSurface">
            Return Assets to Available Status
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="text-center mb-6">
            <p className="body-medium text-onSurfaceVariant">
              Return allocated or assigned assets back to available status for
              future allocation.
            </p>
          </div>

          <div className="bg-surfaceContainer border border-outline rounded-lg p-4">
            <h4 className="title-small text-onSurface mb-4">Return Type</h4>
            <div className="space-y-3">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  returnType === "location-return"
                    ? "border-primary bg-primaryContainer"
                    : "border-outline hover:border-primary"
                }`}
                onClick={() => setReturnType("location-return")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                    {returnType === "location-return" && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <div>
                    <h5 className="label-medium-bold text-onSurface">
                      Location Return
                    </h5>
                    <p className="body-small text-onSurfaceVariant">
                      Return assets currently allocated to locations
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  returnType === "user-return"
                    ? "border-primary bg-primaryContainer"
                    : "border-outline hover:border-primary"
                }`}
                onClick={() => setReturnType("user-return")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                    {returnType === "user-return" && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <div>
                    <h5 className="label-medium-bold text-onSurface">
                      User Return
                    </h5>
                    <p className="body-small text-onSurfaceVariant">
                      Return assets currently assigned to users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {returnType && (
            <div className="bg-primaryContainer border border-primary rounded-lg p-4">
              <h4 className="title-small text-primary mb-4">Return Details</h4>
              <div className="flex flex-col gap-1">
                <label className="body-small text-onSurface">
                  {`Select ${
                    returnType === "location-return" ? "Location" : "Users"
                  } *`}
                </label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder={
                    returnType === "location-return"
                      ? "Enter location to return from"
                      : "Select users to return from"
                  }
                />
              </div>
              <p className="body-small text-onPrimaryContainer mt-2">
                Assets from this{" "}
                {returnType === "location-return" ? "location" : "user"} will be
                returned to available status
              </p>
            </div>
          )}

          {returnType && (
            <div className="p-4 bg-surfaceContainer border border-outline rounded-lg">
              <h4 className="title-small text-onSurface mb-4">
                Asset Selection
              </h4>
              <p className="body-medium text-onSurfaceVariant">
                Asset selection interface would be implemented here
              </p>
            </div>
          )}

          <div>
            <label className="label-medium text-onSurface mb-2 block">
              Return Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-outline rounded-lg bg-surface text-onSurface body-medium resize-none focus:border-primary focus:ring-1 focus:ring-primary"
              rows={3}
              placeholder="Reason for return or additional notes (optional)..."
            />
            <p className="body-small text-onSurfaceVariant mt-1">
              Optional: Add notes about the reason for returning these assets
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-outline pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!returnType || !source}>
            Complete Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnModal;
