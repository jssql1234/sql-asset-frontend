import React, { useEffect, useMemo } from "react";
import { Option, Card } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { SearchableDropdown } from "@/components/SearchableDropdown";
import type { UseFormRegister, UseFormSetValue, UseFormWatch, Control, FieldErrors } from "react-hook-form";
import type { CreateAssetFormData } from "../zod/createAssetForm";
import SelectDropdown, { type SelectDropdownOption } from "@/components/SelectDropdown";
import { usePermissions } from "@/hooks/usePermissions";
import { ALLOWANCE_GROUPS } from "@/constants/allowanceGroups";

interface AllowanceTabProps {
  register: UseFormRegister<CreateAssetFormData>;
  setValue: UseFormSetValue<CreateAssetFormData>;
  watch: UseFormWatch<CreateAssetFormData>;
  control: Control<CreateAssetFormData>;
  errors?: FieldErrors<CreateAssetFormData>;
  selectedTaxYear?: string;
  taxYearOptions?: SelectDropdownOption[];
}

const AllowanceTab: React.FC<AllowanceTabProps> = ({ register, setValue, watch, selectedTaxYear, taxYearOptions }) => {
  const { hasPermission } = usePermissions();
  const isTaxAgent = hasPermission("processCA", "execute");
  const isAdmin = hasPermission("maintainItem", "execute") && hasPermission("processCA", "execute");

  // Generate CA Asset Group options from ALLOWANCE_GROUPS
  const caAssetGroupOptions: SelectDropdownOption[] = useMemo(() => (
    Object.entries(ALLOWANCE_GROUPS).map(([code, group]) => ({
      value: code,
      label: `${code} - ${group.name}`,
    }))
  ), []);

  // For tax agents, allowance tab is readonly except for the most recent tax year
  // Most recent tax year is determined by the highest year in available tax years
  // Admin users have full edit access regardless of tax year
  const mostRecentTaxYear = Math.max(...(taxYearOptions ?? []).map(option => parseInt(option.value)));
  const selectedYearNum = selectedTaxYear ? parseInt(selectedTaxYear) : mostRecentTaxYear;
  const isMostRecentTaxYear = selectedYearNum === mostRecentTaxYear;
  const isReadonly = isAdmin ? false : (isTaxAgent && !isMostRecentTaxYear);

  const caAssetGroupValue = watch("caAssetGroup", "");
  const allowanceClassValue = watch("allowanceClass", "");
  const subClassValue = watch("subClass", "");
  const cost = watch("cost");
  const quantityPerUnit = watch("quantityPerUnit");
  const manualQE = watch("manualQE", false); 
  // Watched values for QE calculation
  const isMotorVehicle = watch("extraCheckbox");
  const isCommercial = watch("extraCommercial");
  const isNewVehicle = watch("extraNewVehicle");

  // Percentage options for dropdowns
  const percentageOptions = [
    { id: "0", label: "0" },
    { id: "25", label: "25" },
    { id: "33", label: "33" },
    { id: "50", label: "50" },
    { id: "100", label: "100" },
  ];

  // Calculate cost per unit for conditional rendering
  const totalCost = cost && cost.trim() !== "" ? parseFloat(cost) : 0;
  const qtyPerUnit = quantityPerUnit || 1;
  const costPerUnit = totalCost / qtyPerUnit;

  // Generate Allowance Class options based on selected CA Asset Group
  const allowanceClassOptions: SelectDropdownOption[] = useMemo(() => {
    if (!caAssetGroupValue) {
      return [];
    }
    const group = ALLOWANCE_GROUPS[caAssetGroupValue];
    const costPerUnit = cost && quantityPerUnit ? parseFloat(cost) / quantityPerUnit : 0;
    return Object.entries(group.classes).map(([code, allowanceClass]) => ({
      value: code,
      label: `${code} - ${allowanceClass.name}`,
      disabled: code === "6" && costPerUnit > 2000,
    }));
  }, [caAssetGroupValue, cost, quantityPerUnit]);

  // Generate Sub Class options based on selected Allowance Class
  const subClassOptions: SelectDropdownOption[] = useMemo(() => {
    if (!caAssetGroupValue || !allowanceClassValue) {
      return [];
    }
    const group = ALLOWANCE_GROUPS[caAssetGroupValue];
    const allowanceClass = group.classes[allowanceClassValue];
    const entries = allowanceClass.entries;
    return Object.entries(entries).map(([code, entry]) => ({
      value: code,
      label: code === "-" ? entry?.type ?? "N/A" : `${code} - ${entry?.type ?? "Unknown"}`,
    }));
  }, [caAssetGroupValue, allowanceClassValue]);

  // Check if the selected class has subclasses
  const hasSubclasses = useMemo(() => {
    if (!caAssetGroupValue || !allowanceClassValue) return false;
    const group = ALLOWANCE_GROUPS[caAssetGroupValue];
    const allowanceClass = group.classes[allowanceClassValue];
    const entries = allowanceClass.entries;
    return Object.keys(entries).length > 1;
  }, [caAssetGroupValue, allowanceClassValue]);

  // Auto-populate IA and AA rates when subclass is selected
  useEffect(() => {
    if (caAssetGroupValue && allowanceClassValue && subClassValue) {

      const entry = ALLOWANCE_GROUPS[caAssetGroupValue].classes[allowanceClassValue].entries[subClassValue];
      if (entry) {
        setValue("iaRate", entry.ia_rate.toString());
        setValue("aaRate", entry.aa_rate.toString());
      }
    }
  }, [caAssetGroupValue, allowanceClassValue, subClassValue, setValue]);

  // Clear dependent fields when parent changes
  useEffect(() => {
    setValue("allowanceClass", "");
    setValue("subClass", "");
    setValue("iaRate", "");
    setValue("aaRate", "");
  }, [caAssetGroupValue, setValue]);

  useEffect(() => {
    setValue("subClass", "");
    setValue("iaRate", "");
    setValue("aaRate", "");
  }, [allowanceClassValue, setValue]);

  // Clear subclass when switching between classes to prevent stale values
  useEffect(() => {
    if (allowanceClassValue && caAssetGroupValue) {
      const group = ALLOWANCE_GROUPS[caAssetGroupValue];
      const allowanceClass = group.classes[allowanceClassValue];
      const currentSubClass = watch("subClass");
      if (currentSubClass && !(currentSubClass in allowanceClass.entries)) {
        setValue("subClass", "");
        setValue("iaRate", "");
        setValue("aaRate", "");
      }
    }
  }, [allowanceClassValue, caAssetGroupValue, setValue, watch]);

  // Handle E6 class restriction based on cost per unit
  useEffect(() => {
    const costPerUnit = cost && quantityPerUnit ? parseFloat(cost) / quantityPerUnit : 0;

    if (allowanceClassValue === "6" && costPerUnit > 2000) {
      setValue("allowanceClass", "1");
      setValue("subClass", "a");
    }
  }, [allowanceClassValue, cost, quantityPerUnit, setValue]);

  // Auto-select subclass if there's only one option (no subclasses)
  useEffect(() => {
    if (manualQE) return;
    if (caAssetGroupValue && allowanceClassValue && !hasSubclasses) {
      const group = ALLOWANCE_GROUPS[caAssetGroupValue];
      const allowanceClass = group.classes[allowanceClassValue];
      const entries = allowanceClass.entries;
      const singleEntryKey = Object.keys(entries)[0];
      if (singleEntryKey) {
        setValue("subClass", singleEntryKey);
      }
    }
  }, [caAssetGroupValue, allowanceClassValue, hasSubclasses, setValue]);

  // Auto-uncheck remaining checkboxes when Motor Vehicle is deselected
  useEffect(() => {
    if (!isMotorVehicle) {
      setValue("extraCommercial", false);
      setValue("extraNewVehicle", false);
    }
  }, [isMotorVehicle, setValue]);

  // Auto-uncheck New Vehicle when Commercial Use is selected
  useEffect(() => {
    if (isCommercial && isNewVehicle) {
      setValue("extraNewVehicle", false);
    }
  }, [isCommercial, isNewVehicle, setValue]);

  // Calculate qualify amount (QE) based on motor vehicle rules
  useEffect(() => {
    const totalCost = cost && cost.trim() !== "" ? parseFloat(cost) : 0;
    const qtyPerUnit = quantityPerUnit || 1;
    const costPerUnit = totalCost / qtyPerUnit;

    if (isMotorVehicle) {
      if (isCommercial) {
        // No cap for commercial use
        setValue("qeValue", totalCost.toString());
      } else {
        // Non-commercial use
        if (costPerUnit <= 150000 && isNewVehicle) {
          // Cap at 100k per unit
          const cappedAmount = Math.min(costPerUnit, 100000) * qtyPerUnit;
          setValue("qeValue", cappedAmount.toString());
        } else {
          // Cap at 50k per unit
          const cappedAmount = Math.min(costPerUnit, 50000) * qtyPerUnit;
          setValue("qeValue", cappedAmount.toString());
        }
      }
    } else {
      // Not a motor vehicle, use total cost
      setValue("qeValue", totalCost.toString());
    }
  }, [isMotorVehicle, isCommercial, isNewVehicle, cost, quantityPerUnit, setValue]);

  return (
    <Card className="p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">CA Asset Group</label>
          <SelectDropdown
            className="w-full"
            value={caAssetGroupValue}
            placeholder="-- Choose Group --"
            options={caAssetGroupOptions}
            onChange={(nextValue) => {
              setValue("caAssetGroup", nextValue);
            }}
            disabled={isReadonly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Allowance Class</label>
          <SelectDropdown
            className="w-full"
            value={allowanceClassValue}
            placeholder="-- Choose Code --"
            options={allowanceClassOptions}
            onChange={(nextValue) => {
              setValue("allowanceClass", nextValue);
            }}
            disabled={isReadonly || !caAssetGroupValue}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Sub Class</label>
          <SelectDropdown
            className="w-full"
            value={subClassValue}
            placeholder="-- Choose Type --"
            options={subClassOptions}
            onChange={(nextValue) => {
              setValue("subClass", nextValue);
            }}
            disabled={isReadonly || !hasSubclasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">IA Rate</label>
          <Input {...register("iaRate")} readOnly={!watch("aca")} disabled={!watch("aca") || isReadonly} />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">AA Rate</label>
          <Input {...register("aaRate")} readOnly={!watch("aca")} disabled={!watch("aca") || isReadonly} />
        </div>
        <div className="flex items-center gap-2 mt-7">
          <Option type="checkbox" {...register("aca")} checked={watch("aca")} disabled={isReadonly} />
          <label className="body-small text-onSurfaceVariant">ACA</label>
        </div>
      </div>

      {watch("caAssetGroup") === "E" && watch("allowanceClass") === "1" && watch("subClass") === "a" && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Option type="checkbox" {...register("extraCheckbox")} checked={watch("extraCheckbox")} disabled={isReadonly} />
            <label
              className="body-small text-onSurfaceVariant cursor-pointer"
              onClick={() => {
                if (!isReadonly) {
                  setValue("extraCheckbox", !watch("extraCheckbox"));
                }
              }}
            >
              Motor Vehicle
            </label>
          </div>
          <div className="flex flex-col">
          
            <div className="flex items-center gap-2 mb-3">
              <Option type="checkbox" {...register("extraCommercial")} checked={watch("extraCommercial")} disabled={isReadonly || !isMotorVehicle}/>
              <label
                className="body-small text-onSurfaceVariant cursor-pointer"
                onClick={() => {
                  if (!(isReadonly || !isMotorVehicle)) {
                    setValue("extraCommercial", !watch("extraCommercial"));
                  }
                }}
              >
                Commercial Use
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Option type="checkbox" {...register("extraNewVehicle")} checked={watch("extraNewVehicle")} disabled={isReadonly || !isMotorVehicle || (isCommercial || costPerUnit > 150000)} />
              <label
                className="body-small text-onSurfaceVariant cursor-pointer"
                onClick={() => {
                  if (!(isReadonly || !isMotorVehicle || (isCommercial || costPerUnit > 150000)) ) {
                    setValue("extraNewVehicle", !watch("extraNewVehicle"));
                  }
                }}
              >
                New Vehicle
              </label>
            </div>

          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-onSurface">Qualifying Expenditure (QE)</label>
            <div className="flex items-center gap-2">
              <Option 
                type="checkbox" 
                {...register("manualQE")} 
                checked={manualQE} 
                disabled={isReadonly}
              />
              <label className="text-sm text-onSurfaceVariant">Manual Q</label>
            </div>
          </div>
          <Input 
            {...register("qeValue")} 
            readOnly={!manualQE} 
            disabled={!manualQE}
            className={`${!manualQE ? 'bg-surfaceContainerHighest' : 'bg-white'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Controlled Transfer B/F RE</label>
          <Input {...register("residualExpenditure")} placeholder="0.00" disabled={isReadonly} />
        </div>
        {caAssetGroupValue === "E" && (
          <div>
            <label className="block text-sm font-medium text-onSurface">Self Use %</label>
            <SearchableDropdown
              items={percentageOptions}
              value={watch("selfUsePercentage")}
              onChange={(value) => {
                setValue("selfUsePercentage", value);
              }}
              disabled={isReadonly}
              position='top'
              hideEmptyMessage
              mode='freeInput'
            />
          </div>
        )}
        {caAssetGroupValue === "D" && (
          <div>
            <label className="block text-sm font-medium text-onSurface">Rented Apportion %</label>
            <SearchableDropdown
              items={percentageOptions}
              value={watch("rentedApportionPercentage")}
              onChange={(value) => {
                setValue("rentedApportionPercentage", value);
              }}
              disabled={isReadonly}
              position='top'
              hideEmptyMessage
              mode='freeInput'
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export { AllowanceTab };