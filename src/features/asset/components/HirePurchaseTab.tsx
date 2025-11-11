import { Card } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { Button } from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import type { UseFormRegister, UseFormSetValue, UseFormWatch, Control } from "react-hook-form";
import type { CreateAssetFormData } from "../zod/createAssetForm";
import { SearchableDropdown } from "@/components/SearchableDropdown";
import { usePermissions } from "@/hooks/usePermissions"; 

interface HirePurchaseTabProps {
  register: UseFormRegister<CreateAssetFormData>;
  setValue: UseFormSetValue<CreateAssetFormData>;
  watch: UseFormWatch<CreateAssetFormData>;
  control: Control<CreateAssetFormData>;
  onManagePaymentClick: () => void;
}

const HirePurchaseTab: React.FC<HirePurchaseTabProps> = ({ register, setValue, watch, onManagePaymentClick }) => {
  const hpInstalmentValue = watch("hpInstalment", "");
  const hpStartDate = watch("hpStartDate", "");
  const hpDeposit = watch("hpDeposit", "");
  const hpInterest = watch("hpInterest");
  const cost = watch("cost", "");
  const { hasPermission } = usePermissions();
  const isTaxAgent = hasPermission("processCA", "execute");
  const isAdmin = hasPermission("maintainItem", "execute") && hasPermission("processCA", "execute");
  const isReadonly = isAdmin ? false : isTaxAgent;
  const isHpEnabled = !!hpStartDate; // Enable other fields only if HP Start Date is filled

  // Check if all required fields are present for Manage Payment button
  const isManagePaymentEnabled = !!(
    hpStartDate &&
    hpInstalmentValue &&
    hpDeposit &&
    hpInterest &&
    hpInterest !== 0 &&
    cost
  );

  // Options for instalment dropdown (excluding "Other")
  const instalmentOptions = [
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
                formatted = date.toLocaleDateString('en-CA');
              }
              setValue("hpStartDate", formatted);
            }}
            className="border-none"
            disabled={isReadonly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">No. Instalment (months)</label>
          <SearchableDropdown
            items={instalmentOptions}
            value={hpInstalmentValue}
            onChange={(value) => {
              setValue("hpInstalment", value);
            }}
            disabled={isReadonly || !isHpEnabled}
            placeholder="Select Instalment"
            position="top"
            hideEmptyMessage
            mode="freeInput"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Deposit Amount</label>
          <Input {...register("hpDeposit")} placeholder="0.00" disabled={isReadonly || !isHpEnabled} />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Interest Rate (%)</label>
          <Input type="number" {...register("hpInterest")} min="0" max="100" placeholder="0.00" disabled={isReadonly || !isHpEnabled} />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Finance</label>
          <Input {...register("hpFinance")} placeholder="ABC BANK" disabled={isReadonly || !isHpEnabled} />
        </div>

        {/* Manage Payment Button */}
        <div className="flex flex-col justify-end">
          <Button
            variant="primary"
            disabled={!isManagePaymentEnabled || isReadonly}
            className="px-6 py-4 w-full"
            onClick={onManagePaymentClick}
          >
            Manage Payment
          </Button>
        </div>
      </div>
    </Card>
  );
};

export { HirePurchaseTab };