import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/components";
import { Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [transferType, setTransferType] = useState<
    "location-to-location" | "user-to-user" | null
  >(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const resetModal = () => {
    setStep(1);
    setTransferType(null);
    setSource("");
    setDestination("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = () => {
    // Logic to transfer assets
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-surface">
        <DialogHeader className="border-b border-outline pb-4">
          <DialogTitle className="title-medium text-onSurface">
            Asset Transfer - Step {step}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="p-6">
            <div className="text-center mb-8">
              <h4 className="title-small text-onSurface mb-2">
                Choose Transfer Type
              </h4>
              <p className="body-medium text-onSurfaceVariant">
                Select the type of transfer you want to perform between
                locations or users.
              </p>
            </div>

            <div className="flex gap-6 justify-center">
              <div
                className="flex-1 max-w-xs border-2 border-outline hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-all bg-surface hover:bg-primaryContainer"
                onClick={() => {
                  setTransferType("location-to-location");
                  setStep(2);
                }}
              >
                <div className="w-16 h-16 bg-warning rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <h5 className="label-large-bold text-onSurface mb-2">
                  Location to Location
                </h5>
                <p className="body-small text-onSurfaceVariant">
                  Transfer assets between different physical locations or
                  departments.
                </p>
              </div>

              <div
                className="flex-1 max-w-xs border-2 border-outline hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-all bg-surface hover:bg-primaryContainer"
                onClick={() => {
                  setTransferType("user-to-user");
                  setStep(2);
                }}
              >
                <div className="w-16 h-16 bg-error rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h5 className="label-large-bold text-onSurface mb-2">
                  User to User
                </h5>
                <p className="body-small text-onSurfaceVariant">
                  Transfer asset assignment from one person to another person.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                    <path d="M7.5 8a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0zM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695z" />
                  </svg>
                </div>
                <h4 className="title-small text-onSurface">Transfer Details</h4>
              </div>

              <div className="bg-primaryContainer border border-primary rounded-lg p-4">
                <h5 className="label-medium-bold text-primary mb-4">
                  Source & Destination
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="body-small text-onSurface">
                      {`Source ${
                        transferType === "location-to-location"
                          ? "Location"
                          : "User"
                      } *`}
                    </label>
                    <Input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder={`Select source ${
                        transferType === "location-to-location"
                          ? "location"
                          : "user"
                      }`}
                    />
                    <p className="body-small text-onSurfaceVariant mt-1">
                      Current{" "}
                      {transferType === "location-to-location"
                        ? "location"
                        : "assignee"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="body-small text-onSurface">
                      {`Destination ${
                        transferType === "location-to-location"
                          ? "Location"
                          : "User"
                      } *`}
                    </label>
                    <Input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder={`Select destination ${
                        transferType === "location-to-location"
                          ? "location"
                          : "user"
                      }`}
                    />
                    <p className="body-small text-onSurfaceVariant mt-1">
                      New{" "}
                      {transferType === "location-to-location"
                        ? "location"
                        : "assignee"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surfaceContainer border border-outline rounded-lg">
                <h4 className="title-small text-onSurface mb-4">
                  Asset Selection
                </h4>
                <p className="body-medium text-onSurfaceVariant">
                  Asset selection interface would be implemented here
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-outline pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              ← Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 2 && (
            <Button onClick={handleSubmit}>Complete Transfer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;
