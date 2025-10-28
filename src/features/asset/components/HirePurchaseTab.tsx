import React from "react";
import { Card } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import type { UseFormRegister, UseFormSetValue, UseFormWatch, Control } from "react-hook-form";
import type { CreateAssetFormData } from "../zod/createAssetForm";
import { SearchableInputDropdown, type DropdownOption } from "@/components/SearchableInputDropdown";
import { usePermissions } from "@/hooks/usePermissions";

interface HirePurchaseTabProps {
  register: UseFormRegister<CreateAssetFormData>;
  setValue: UseFormSetValue<CreateAssetFormData>;
  watch: UseFormWatch<CreateAssetFormData>;
  control: Control<CreateAssetFormData>;
}

const HirePurchaseTab: React.FC<HirePurchaseTabProps> = ({ register, setValue, watch }) => {
  const hpInstalmentValue = watch("hpInstalment", "");
  const { hasPermission } = usePermissions();
  const isTaxAgent = hasPermission("processCA", "execute");
  const isAdmin = hasPermission("maintainItem", "execute") && hasPermission("processCA", "execute");
  const isReadonly = isAdmin ? false : isTaxAgent;

  // Options for instalment dropdown (excluding "Other")
  const instalmentOptions: DropdownOption[] = [
    { id: "12", label: "12" },
    { id: "24", label: "24" },
    { id: "36", label: "36" },
    { id: "48", label: "48" },
    { id: "60", label: "60" },
  ];

  return (
    <Card className="p-6 shadow-sm">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">HP Start Date</label>
          <SemiDatePicker
            inputType="date"
            value={watch("hpStartDate")}
            onChange={(date) => {
              let formatted = '';
              if (typeof date === 'string') {
                formatted = date;
              } else if (date instanceof Date) {
                formatted = date.toISOString().split('T')[0];
              }
              setValue("hpStartDate", formatted);
            }}
            className="border-none"
            disabled={isReadonly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">No. Instalment (months)</label>
          <SearchableInputDropdown
            value={hpInstalmentValue}
            onChange={(value) => {
              setValue("hpInstalment", value);
            }}
            options={instalmentOptions}
            disabled={isReadonly}
            placeholder="Select Instalment"
            position= "top"
          />
        </div>
        {hpInstalmentValue === "other" && (
          <div>
            <label className="block text-sm font-medium text-onSurface">Custom Instalment</label>
            <Input type="number" {...register("hpInstalmentUser")} disabled={isReadonly} />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-onSurface">Deposit Amount</label>
          <Input {...register("hpDeposit")} placeholder="0.00" disabled={isReadonly} />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Interest Rate (%)</label>
          <Input type="number" {...register("hpInterest")} min="0" max="100" placeholder="0.00" disabled={isReadonly} />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Finance</label>
          <Input {...register("hpFinance")} placeholder="0.00" disabled={isReadonly} />
        </div>
      </div>
    </Card>
  );
};

export { HirePurchaseTab };