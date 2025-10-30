import React, { useState, useRef, useImperativeHandle, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVirtualizer } from "@tanstack/react-virtual";
import { createAssetFormSchema, type CreateAssetFormData } from "../zod/createAssetForm";
import { Option, Tabs, type TabItem, Button, Card } from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { Tooltip } from "@/components/ui/components/Tooltip";
import TabHeader from "@/components/TabHeader";
import { SerialNumberTab } from "./SerialNumberTab";
import { DepreciationTab, type DepreciationScheduleViewState } from "./DepreciationTab";
import { AllowanceTab } from "./AllowanceTab";
import { HirePurchaseTab } from "./HirePurchaseTab";
import type { UseFormRegister, UseFormSetValue, UseFormWatch, Control, FieldErrors } from "react-hook-form";
import type { Asset } from "@/types/asset";
import SelectDropdown, { type SelectDropdownOption } from "@/components/SelectDropdown";
import { usePermissions } from "@/hooks/usePermissions";
import BatchDetachModal from "./BatchDetachModal";
import { useGetBatchAssets, useGetBatchQuantity, useBulkUpdateAssets, useCreateMultipleAssets, useBulkUpdateAssetBatchId, useGetAsset } from "../hooks/useAssetService";

interface SerialNumberData {
  serial: string;
  remark: string;
}

interface TabProps {
  register: UseFormRegister<CreateAssetFormData>;
  setValue: UseFormSetValue<CreateAssetFormData>;
  watch: UseFormWatch<CreateAssetFormData>;
  control: Control<CreateAssetFormData>;
  errors?: FieldErrors<CreateAssetFormData>;
  selectedTaxYear?: string;
  taxYearOptions?: SelectDropdownOption[];
}

interface AssetFormProps {
  onSuccess?: (data: CreateAssetFormData) => void;
  onBack?: () => void;
  editingAsset?: Asset | null;
  selectedTaxYear?: string;
  taxYearOptions?: SelectDropdownOption[];
  userRole?: 'taxAgent' | 'admin' | 'normal';
}

interface AssetFormRef {
  submit: () => void;
}

const scheduleCurrencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatScheduleCurrency = (value: number): string => `RM ${scheduleCurrencyFormatter.format(Number.isFinite(value) ? value : 0)}`;

const DepreciationSchedulePanel: React.FC<{ view: DepreciationScheduleViewState | null }> = ({ view }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rows = view?.state.rows ?? [];
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  if (!view) {
    return (
      <Card className="p-6 shadow-md">
        <h3 className="title-small text-onSurface mb-2">Depreciation Schedule</h3>
        <p className="body-medium text-onSurfaceVariant">Complete the depreciation details to generate the schedule.</p>
      </Card>
    );
  }

  const { state, controls } = view;

  const handleDepreciationChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(event.target.value);
    controls.updateEditableRow(index, Number.isFinite(value) ? value : 0);
  };

  return (
    <Card className="p-6 sticky top-24 shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="title-small text-onSurface">Depreciation Schedule</h3>
          <p className="body-small text-onSurfaceVariant">
            {state.isManual ? "Manual schedule" : "Straight line schedule"}
            {state.ceilingApplied && !state.isEditing ? " · ceiling rounded" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={controls.applyCeilingRounding}
            disabled={rows.length === 0 || (!state.isEditing && state.ceilingApplied)}
          >
            Ceiling Rounding
          </Button>
          {state.isEditing ? (
            <>
              <Button size="sm" onClick={controls.saveEditMode}>Save</Button>
              <Button size="sm" variant="outline" onClick={controls.cancelEditMode}>Cancel</Button>
              <Button size="sm" variant="ghost" onClick={controls.addEditableRow}>+ Row</Button>
              <Button size="sm" variant="ghost" onClick={controls.removeEditableRow} disabled={rows.length <= 1}>- Row</Button>
            </>
          ) : (
            <Button size="sm" onClick={controls.enterEditMode} disabled={rows.length === 0}>Edit</Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          ref={parentRef}
          className="overflow-y-auto"
          style={{
            maxHeight: rows.length > 12 ? '600px' : 'none',
          }}
        >
          <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '37.5%' }} />
              <col style={{ width: '37.5%' }} />
            </colgroup>
            <thead className="text-onSurfaceVariant text-sm sticky top-0 bg-surface z-10">
              <tr>
                <th className="pb-2 pr-4 font-medium" style={{ width: '25%' }}>{state.isMonthly ? "Month" : "Year"}</th>
                <th className="pb-2 pr-4 font-medium" style={{ width: '37.5%' }}>Net Book Value</th>
                <th className="pb-2 pr-4 font-medium" style={{ width: '37.5%' }}>Depreciation</th>
              </tr>
            </thead>
            <tbody className="text-sm" style={{ height: `${String(rowVirtualizer.getTotalSize())}px`, position: 'relative' }}>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-onSurfaceVariant">
                    Schedule will be generated once depreciation inputs are provided.
                  </td>
                </tr>
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr
                      key={row.label}
                      className="border-t border-outlineVariant/30"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${String(virtualRow.size)}px`,
                        transform: `translateY(${String(virtualRow.start)}px)`,
                        display: 'table',
                        tableLayout: 'fixed',
                      }}
                    >
                      <td className="py-3 pr-4 whitespace-nowrap" style={{ width: '25%' }}>{row.label}</td>
                      <td className="py-3 pr-4 whitespace-nowrap" style={{ width: '37.5%' }}>{formatScheduleCurrency(row.netBookValue)}</td>
                      <td className="py-3 pr-4" style={{ width: '37.5%' }}>
                        {state.isEditing ? (
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={Number.isFinite(row.depreciation) ? row.depreciation : 0}
                            onChange={handleDepreciationChange(virtualRow.index)}
                            min={0}
                          />
                        ) : (
                          <span>{formatScheduleCurrency(row.depreciation)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

const AllocationTab: React.FC<TabProps> = ({ register, setValue, watch }) => {
  const branchOptions: SelectDropdownOption[] = useMemo(() => ([
    { value: "HQ", label: "Headquarters" },
    { value: "KL", label: "Kuala Lumpur Branch" },
    { value: "JB", label: "Johor Bahru Branch" },
    { value: "PG", label: "Penang Branch" },
    { value: "KT", label: "Kuantan Branch" },
    { value: "KC", label: "Kuching Branch" },
    { value: "KK", label: "Kota Kinabalu Branch" },
  ]), []);

  const departmentOptions: SelectDropdownOption[] = useMemo(() => ([
    { value: "IT", label: "Information Technology" },
    { value: "HR", label: "Human Resources" },
    { value: "FIN", label: "Finance" },
    { value: "OPS", label: "Operations" },
    { value: "MKT", label: "Marketing" },
    { value: "ADM", label: "Administration" },
    { value: "LEG", label: "Legal" },
    { value: "AUD", label: "Audit" },
  ]), []);

  const locationOptions: SelectDropdownOption[] = useMemo(() => ([
    { value: "HQ-L1", label: "HQ - Level 1" },
    { value: "HQ-L2", label: "HQ - Level 2" },
    { value: "HQ-L3", label: "HQ - Level 3" },
    { value: "HQ-L4", label: "HQ - Level 4" },
    { value: "HQ-L5", label: "HQ - Level 5" },
    { value: "KL-L1", label: "KL Branch - Level 1" },
    { value: "KL-L2", label: "KL Branch - Level 2" },
    { value: "JB-L1", label: "JB Branch - Level 1" },
    { value: "JB-L2", label: "JB Branch - Level 2" },
    { value: "PG-L1", label: "Penang Branch - Level 1" },
    { value: "PG-L2", label: "Penang Branch - Level 2" },
    { value: "WAREHOUSE", label: "Warehouse" },
    { value: "STORAGE", label: "Storage Room" },
    { value: "MEETING-RM", label: "Meeting Room" },
    { value: "CONF-RM", label: "Conference Room" },
  ]), []);

  const personInChargeOptions: SelectDropdownOption[] = useMemo(() => ([
    { value: "EMP001", label: "John Doe (EMP001) - IT Manager" },
    { value: "EMP002", label: "Jane Smith (EMP002) - HR Manager" },
    { value: "EMP003", label: "Michael Chen (EMP003) - Finance Manager" },
    { value: "EMP004", label: "Sarah Johnson (EMP004) - Operations Manager" },
    { value: "EMP005", label: "David Lee (EMP005) - IT Technician" },
    { value: "EMP006", label: "Emma Wilson (EMP006) - HR Executive" },
    { value: "EMP007", label: "Robert Kim (EMP007) - Finance Executive" },
    { value: "EMP008", label: "Lisa Brown (EMP008) - Admin Executive" },
    { value: "EMP009", label: "Kevin Tan (EMP009) - Operations Executive" },
    { value: "EMP010", label: "Amy Wong (EMP010) - Marketing Executive" },
    { value: "EMP011", label: "Thomas Lim (EMP011) - Legal Officer" },
    { value: "EMP012", label: "Rachel Ng (EMP012) - Audit Officer" },
  ]), []);

  const branchValue = watch("branch", "");
  const departmentValue = watch("department", "");
  const locationValue = watch("location", "");
  const personInChargeValue = watch("personInCharge", "");

  return (
    <Card className="p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Branch</label>
          <SelectDropdown
            className="w-full"
            value={branchValue}
            placeholder="-- Select Branch --"
            options={branchOptions}
            onChange={(nextValue) => {
              setValue("branch", nextValue);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Department</label>
          <SelectDropdown
            className="w-full"
            value={departmentValue}
            placeholder="-- Select Department --"
            options={departmentOptions}
            onChange={(nextValue) => {
              setValue("department", nextValue);
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Location</label>
          <SelectDropdown
            className="w-full"
            value={locationValue}
            placeholder="-- Select Location --"
            options={locationOptions}
            onChange={(nextValue) => {
              setValue("location", nextValue);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Person in Charge</label>
          <SelectDropdown
            className="w-full"
            value={personInChargeValue}
            placeholder="-- Select Person --"
            options={personInChargeOptions}
            onChange={(nextValue) => {
              setValue("personInCharge", nextValue);
            }}
          />
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-onSurface">Additional Notes</label>
        <TextArea {...register("allocationNotes")} placeholder="Any additional information about the asset allocation" rows={3} />
      </div>
    </Card>
  );
};


const WarrantyTab: React.FC<TabProps> = ({ register, control }) => {
  return (
    <Card className="p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Warranty Provider</label>
          <Input {...register("warrantyProvider")} placeholder="Enter warranty provider" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Start Date</label>
          <Controller
            name="warrantyStartDate"
            control={control}
            render={({ field }) => (
              <SemiDatePicker
                inputType="date"
                value={field.value}
                onChange={(date) => {
                  let formatted = '';
                  if (typeof date === 'string') {
                    formatted = date;
                  } else if (date instanceof Date) {
                    formatted = date.toISOString().split('T')[0];
                  }
                  field.onChange(formatted);
                }}
                className="border-none"
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">End Date</label>
          <Controller
            name="warrantyEndDate"
            control={control}
            render={({ field }) => (
              <SemiDatePicker
                inputType="date"
                value={field.value}
                onChange={(date) => {
                  let formatted = '';
                  if (typeof date === 'string') {
                    formatted = date;
                  } else if (date instanceof Date) {
                    formatted = date.toISOString().split('T')[0];
                  }
                  field.onChange(formatted);
                }}
                className="border-none"
                placeholder="Select date"
              />
            )}
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-onSurface">Notes</label>
        <TextArea {...register("warrantyNotes")} rows={3} placeholder="Additional warranty notes" />
      </div>
    </Card>
  );
};

const AssetForm = ({ ref, ...props }: AssetFormProps & { ref?: React.RefObject<AssetFormRef | null> }) => {
  const { onSuccess, onBack, editingAsset, selectedTaxYear, taxYearOptions, userRole } = props;
  const [depreciationScheduleView, setDepreciationScheduleView] = useState<DepreciationScheduleViewState | null>(null);
  const [showDetachModal, setShowDetachModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingData, setPendingData] = useState<CreateAssetFormData | null>(null);
  const { hasPermission } = usePermissions();

  // Determine user role based on permissions or prop
  const isTaxAgent = hasPermission("processCA", "execute");
  const isAdmin = hasPermission("maintainItem", "execute") && hasPermission("processCA", "execute");

  // Use prop userRole if provided, otherwise determine from permissions
  const effectiveUserRole = userRole ?? (isAdmin ? 'admin' : (isTaxAgent ? 'taxAgent' : 'normal'));

  // Consolidate batch hooks after currentMode state
  // Remove duplicate batchAssets and originalQuantity declarations

  // In the component, after [currentMode, setCurrentMode]
  const [currentMode, setCurrentMode] = useState<'normal' | 'batch'>('normal');

  // Batch hooks here
  const { data: batchAssets } = useGetBatchAssets(currentMode === 'batch' && editingAsset?.batchId ? editingAsset.batchId : '');
  const { data: originalQuantity } = useGetBatchQuantity(currentMode === 'batch' && editingAsset?.batchId ? editingAsset.batchId : '');

  // Remove the duplicate in the second edit

  // Set default active tab based on effective user role
  const getDefaultActiveTab = useCallback(() => {
    if (effectiveUserRole === 'taxAgent' || effectiveUserRole === 'admin') {
      return "allowance";
    }
    return "hire-purchase";
  }, [effectiveUserRole]);

  const [activeTab, setActiveTab] = useState(getDefaultActiveTab);

  // Mode-specific default values
  const normalDefaultValues: CreateAssetFormData = useMemo(() => ({
    inactive: false,
    quantity: 1,
    quantityPerUnit: 1,
    depreciationMethod: "Straight Line",
    depreciationFrequency: "Yearly",
    usefulLife: 10,
    aca: false,
    extraCheckbox: false,
    extraCommercial: false,
    extraNewVehicle: false,
    serialNumbers: [],
    code: "", // Will be prefilled later
    assetName: "",
    assetGroup: "",
    cost: "",
    description: "",
    purchaseDate: "",
    acquireDate: "",
    taxYear: new Date().getFullYear().toString(),
    selfUsePercentage: "100",
    rentedApportionPercentage: "0",
  }), []);

  const batchDefaultValues: CreateAssetFormData = useMemo(() => ({
    inactive: false,
    quantity: 1,
    quantityPerUnit: 1,
    depreciationMethod: "Straight Line",
    depreciationFrequency: "Yearly",
    usefulLife: 10,
    aca: false,
    extraCheckbox: false,
    extraCommercial: false,
    extraNewVehicle: false,
    serialNumbers: [],
    code: "", // Batch ID, will be prefilled
    assetName: "",
    assetGroup: "",
    cost: "",
    description: "",
    purchaseDate: "", // Hidden in batch
    acquireDate: "", // Hidden in batch
    taxYear: new Date().getFullYear().toString(),
    selfUsePercentage: "100",
    rentedApportionPercentage: "0",
  }), []);

  // Separate form instances
  const normalForm = useForm<CreateAssetFormData>({
    resolver: zodResolver(createAssetFormSchema),
    defaultValues: normalDefaultValues,
  });

  const batchForm = useForm<CreateAssetFormData>({
    resolver: zodResolver(createAssetFormSchema),
    defaultValues: batchDefaultValues,
  });

  // Active form reference
  const activeForm = currentMode === 'normal' ? normalForm : batchForm;
  // Ensure mutations are declared early, after permissions
  const bulkUpdateAssetsMutation = useBulkUpdateAssets();
  const createMultipleMutation = useCreateMultipleAssets();
  const bulkDetachMutation = useBulkUpdateAssetBatchId();

  // Active form destructuring without activeReset
  const { register: activeRegister, handleSubmit: activeHandleSubmit, watch: activeWatch, setValue: activeSetValue, control: activeControl, formState: { errors: activeErrors } } = activeForm;

  // Determine initial mode and populate forms
  useEffect(() => {
    if (editingAsset) {
      const isBatchEdit = !!editingAsset.batchId;
      const targetMode: 'normal' | 'batch' = isBatchEdit ? 'batch' : 'normal';
      setCurrentMode(targetMode);

      const targetReset = targetMode === 'normal' ? normalForm.reset : batchForm.reset;

      targetReset({
        code: editingAsset.id,
        batchID: editingAsset.batchId || '',
        assetName: editingAsset.name,
        assetGroup: editingAsset.group,
        description: editingAsset.description,
        acquireDate: editingAsset.acquireDate,
        purchaseDate: editingAsset.purchaseDate,
        cost: editingAsset.cost.toString(),
        quantity: editingAsset.qty || 1,
        quantityPerUnit: 1,
        inactive: !editingAsset.active,
        // Keep defaults for other fields
        depreciationMethod: "Straight Line",
        depreciationFrequency: "Yearly",
        usefulLife: 10,
        aca: false,
        extraCheckbox: false,
        extraCommercial: false,
        extraNewVehicle: false,
        serialNumbers: [],
      });

      // Reset the other form to defaults
      const otherForm = targetMode === 'normal' ? batchForm : normalForm;
      otherForm.reset(targetMode === 'normal' ? batchDefaultValues : normalDefaultValues);
    } else {
      // Creation mode: default to normal, prefill IDs in both (for when switching)
      setCurrentMode('normal');
      normalForm.reset(normalDefaultValues);
      batchForm.reset(batchDefaultValues);
      // Prefill logic will be in separate effect
    }
  }, [editingAsset, normalForm, batchForm, normalDefaultValues, batchDefaultValues]);

  // Set initial quantity for batch edit
  useEffect(() => {
    if (originalQuantity !== undefined && editingAsset && currentMode === 'batch' && editingAsset.batchId) {
      activeSetValue("quantity", originalQuantity);
    }
  }, [originalQuantity, editingAsset, currentMode, activeSetValue]);

  // Determine if we're in edit mode
  const isEditMode = Boolean(editingAsset);
  const title = isEditMode ? "Edit Asset" : "Create Asset";

  // Memoize the serial numbers change handler to prevent unnecessary re-renders
  const handleSerialNumbersChange = useCallback((serialNumbers: SerialNumberData[]) => {
    activeSetValue("serialNumbers", serialNumbers);
  }, [activeSetValue]);

  // Watch form values for reactivity
  const serialNumbersValue = activeWatch("serialNumbers");
  const quantity = activeWatch("quantity");
  const quantityPerUnit = activeWatch("quantityPerUnit");
  const inactive = activeWatch("inactive");

  // Memoize serialNumbers to prevent unnecessary re-renders
  const memoizedSerialNumbers = useMemo(() => serialNumbersValue, [serialNumbersValue]);

  useEffect(() => {
    if (inactive) {
      const today = new Date().toISOString().split('T')[0];
      activeSetValue("inactiveStart", today);
    } else {
      activeSetValue("inactiveStart", "");
    }
  }, [inactive, activeSetValue]);

  const formRef = useRef<HTMLFormElement>(null);

  useImperativeHandle(ref, () => ({
    submit: () => formRef.current?.requestSubmit(),
  }));

  // handleBatchConfirmDetach uses bulkDetachMutation
  const handleBatchConfirmDetach = (selectedIds: string[]) => {
    if (typeof originalQuantity === "number" && pendingData) {
      const numToDetach = originalQuantity - pendingData.quantity;
      if (selectedIds.length === numToDetach) {
        bulkDetachMutation.mutate({ assetIds: selectedIds, newBatchId: null });
        setShowDetachModal(false);
        onSuccess?.(pendingData);
        onBack?.();
      }
    }
  };

  // Ensure detachModalContext is defined once, before return
  const detachModalContext = useMemo(() => {
    if (
      currentMode === 'batch' &&
      editingAsset?.batchId &&
      Array.isArray(batchAssets) &&
      typeof originalQuantity === "number" &&
      pendingData !== null
    ) {
      return {
        batchAssets,
        originalQuantity,
        pendingData,
      };
    }
    return null;
  }, [currentMode, editingAsset, batchAssets, originalQuantity, pendingData]);

  // In return, use {detachModalContext && <BatchDetachModal ... />}

  // Update detachModalContext to use currentMode
  // let detachModalContext: {
  //   batchAssets: Asset[];
  //   originalQuantity: number;
  //   pendingData: CreateAssetFormData;
  // } | null = null;

  // if (
  //   currentMode === 'batch' &&
  //   editingAsset?.batchId &&
  //   Array.isArray(batchAssets) &&
  //   typeof originalQuantity === "number" &&
  //   pendingData !== null
  // ) {
  //   detachModalContext = {
  //     batchAssets,
  //     originalQuantity,
  //     pendingData,
  //   };
  // }

  // Define tabs based on batch mode and user permissions
  const commonTabProps: TabProps = { register: activeRegister, setValue: activeSetValue, watch: activeWatch, control: activeControl, errors: activeErrors, selectedTaxYear, taxYearOptions };

  // Update tabs definition to use currentMode
  const tabs: TabItem[] = currentMode === 'batch'
    ? [
        {
          label: "Allocation",
          value: "allocation",
          content: <AllocationTab {...commonTabProps} />,
        },
        {
          label: "Serial No",
          value: "serial-no",
          content: (
            <SerialNumberTab
              quantity={quantity}
              quantityPerUnit={quantityPerUnit}
              isBatchMode={true}
              serialNumbers={memoizedSerialNumbers}
              onSerialNumbersChange={handleSerialNumbersChange}
            />
          ),
        },
        {
          label: "Warranty",
          value: "warranty",
          content: <WarrantyTab {...commonTabProps} />,
        },
      ]
    : effectiveUserRole === 'taxAgent'
    ? [
        {
          label: "Allowance",
          value: "allowance",
          content: <AllowanceTab {...commonTabProps} />,
        },
        {
          label: "Hire Purchase",
          value: "hire-purchase",
          content: <HirePurchaseTab {...commonTabProps} />,
        },
      ]
    : effectiveUserRole === 'admin'
    ? [
        {
          label: "Allowance",
          value: "allowance",
          content: <AllowanceTab {...commonTabProps} />,
        },
        {
          label: "Hire Purchase",
          value: "hire-purchase",
          content: <HirePurchaseTab {...commonTabProps} />,
        },
        {
          label: "Depreciation",
          value: "depreciation",
          content: (
            <DepreciationTab
              control={activeControl}
              watch={activeWatch}
              setValue={activeSetValue}
              onScheduleStateChange={setDepreciationScheduleView}
            />
          ),
        },
        {
          label: "Allocation",
          value: "allocation",
          content: <AllocationTab {...commonTabProps} />,
        },
        {
          label: "Serial No",
          value: "serial-no",
          content: (
            <SerialNumberTab
              quantity={quantity}
              quantityPerUnit={quantityPerUnit}
              isBatchMode={false}
              serialNumbers={memoizedSerialNumbers}
              onSerialNumbersChange={handleSerialNumbersChange}
            />
          ),
        },
        {
          label: "Warranty",
          value: "warranty",
          content: <WarrantyTab {...commonTabProps} />,
        },
      ]
    : [
        {
          label: "Hire Purchase",
          value: "hire-purchase",
          content: <HirePurchaseTab {...commonTabProps} />,
        },
        {
          label: "Depreciation",
          value: "depreciation",
          content: (
            <DepreciationTab
              control={activeControl}
              watch={activeWatch}
              setValue={activeSetValue}
              onScheduleStateChange={setDepreciationScheduleView}
            />
          ),
        },
        {
          label: "Allocation",
          value: "allocation",
          content: <AllocationTab {...commonTabProps} />,
        },
        {
          label: "Serial No",
          value: "serial-no",
          content: (
            <SerialNumberTab
              quantity={quantity}
              quantityPerUnit={quantityPerUnit}
              isBatchMode={false}
              serialNumbers={memoizedSerialNumbers}
              onSerialNumbersChange={handleSerialNumbersChange}
            />
          ),
        },
        {
          label: "Warranty",
          value: "warranty",
          content: <WarrantyTab {...commonTabProps} />,
        },
      ];

  // Update TabHeader actions: conditional mode toggle
  const modeToggleAction = !editingAsset ? {
    label: currentMode === 'batch' ? "Exit Batch" : "Batch",
    onAction: () => {
      handleModeSwitch(currentMode === 'batch' ? 'normal' : 'batch');
    },
    variant: currentMode === 'batch' ? "destructive" : "default",
    size: "sm" as const,
    position: "inline" as const,
    tooltip: currentMode === 'batch' ? "Exit batch mode" : "Enter batch mode",
  } : null;

  // For onSubmit, ensure it's a block
  const onSubmit = (data: CreateAssetFormData): void => {
    setIsSubmitting(true);
    const isBatchCreate = currentMode === 'batch' && !editingAsset;
    const isBatchEdit = currentMode === 'batch' && editingAsset?.batchId;

    if (isBatchCreate) {
      const batchId = data.code;
      const numAssets = data.quantity;
      const newAssets: Asset[] = [];
      for (let i = 0; i < numAssets; i++) {
        const newId = `ASSET-${batchId}-${String(i + 1).padStart(3, '0')}`;
        newAssets.push({
          id: newId,
          batchId,
          name: data.assetName,
          group: data.assetGroup,
          description: data.description ?? '',
          acquireDate: '',
          purchaseDate: '',
          cost: Number(data.cost ?? '0') || 0,
          qty: 1,
          active: !data.inactive,
        });
      }
      createMultipleMutation.mutate(newAssets);
    } else if (isBatchEdit && batchAssets && originalQuantity !== undefined) {
      const batchId = editingAsset.batchId;
      const newQty = data.quantity;

      const updatePartial = {
        name: data.assetName,
        group: data.assetGroup,
        description: data.description ?? '',
        acquireDate: '',
        purchaseDate: '',
        cost: Number(data.cost ?? '0') || 0,
        active: !data.inactive,
        qty: 1,
      };

      const updatePayloads = batchAssets.map(asset => ({ id: asset.id, ...updatePartial }));

      bulkUpdateAssetsMutation.mutate(updatePayloads);

      if (newQty > originalQuantity) {
        const numToAdd = newQty - originalQuantity;
        const newAssets: Asset[] = [];
        for (let i = 0; i < numToAdd; i++) {
          const newId = `ASSET-${batchId}-${(originalQuantity + i + 1).toString().padStart(3, '0')}`;
          newAssets.push({
            id: newId,
            batchId,
            ...updatePartial,
          });
        }
        createMultipleMutation.mutate(newAssets);
      } else if (newQty < originalQuantity) {
        setPendingData(data);
        setShowDetachModal(true);
        setIsSubmitting(false);
        return;
      }
    } else {
      onSuccess?.(data);
    }

    onBack?.();
    setIsSubmitting(false);
  };

  // Mock data for dropdowns
  const assetGroups: SelectDropdownOption[] = [
    { value: "", label: "-- Choose Asset Group --" },
    { value: "computers", label: "Computers" },
    { value: "furniture", label: "Furniture" },
    { value: "vehicles", label: "Vehicles" },
  ];

  const assetGroupValue = activeWatch("assetGroup", "");

  // Get assets for ID prefill
  const { data: allAssets } = useGetAsset();

  // Functions to generate next IDs
  const generateNextAssetId = useCallback(() => {
    if (!allAssets || allAssets.length === 0) {
      return 'ASSET-001';
    }
    const maxNum = allAssets
      .map(asset => {
        const match = /^ASSET-(\d{3})$/.exec(asset.id);
        return match ? parseInt(match[1], 10) : 0;
      })
      .reduce((max, num) => Math.max(max, num), 0);
    const nextNum = maxNum + 1;
    return `ASSET-${nextNum.toString().padStart(3, '0')}`;
  }, [allAssets]);

  const generateNextBatchId = useCallback(() => {
    if (!allAssets || allAssets.length === 0) {
      return 'B001';
    }
    const batchIds = [...new Set(allAssets.map(a => a.batchId).filter(Boolean))];
    const maxNum = batchIds
      .map(batchId => {
        const match = /^B(\d{3})$/.exec(batchId);
        return match ? parseInt(match[1], 10) : 0;
      })
      .reduce((max, num) => Math.max(max, num), 0);
    const nextNum = maxNum + 1;
    return `B${nextNum.toString().padStart(3, '0')}`;
  }, [allAssets]);

  // Prefill IDs on creation
  useEffect(() => {
    if (!editingAsset && allAssets) {
      // Prefill for normal form
      normalForm.setValue('code', generateNextAssetId());
      // Prefill for batch form
      batchForm.setValue('code', generateNextBatchId());
    }
  }, [allAssets, editingAsset, normalForm, batchForm, generateNextAssetId, generateNextBatchId]);

  // Confirmation modal states
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<'normal' | 'batch' | null>(null);

  // Mode switch handler
  const handleModeSwitch = useCallback((newMode: 'normal' | 'batch') => {
    if (editingAsset) {
      // Disabled in edit mode
      return;
    }
    setPendingMode(newMode);
    setShowModeConfirm(true);
  }, [editingAsset]);

  // Confirm switch
  const confirmModeSwitch = useCallback(() => {
    if (!pendingMode) return;

    // Reset current form
    if (currentMode === 'normal') {
      normalForm.reset(normalDefaultValues);
    } else {
      batchForm.reset(batchDefaultValues);
    }

    setCurrentMode(pendingMode);

    // Adjust active tab
    const defaultTab = pendingMode === 'batch' ? 'allocation' : getDefaultActiveTab();
    setActiveTab(defaultTab);

    // Clear mode-specific fields if switching to batch
    if (pendingMode === 'batch') {
      activeSetValue('purchaseDate', '');
      activeSetValue('acquireDate', '');
    }

    setShowModeConfirm(false);
    setPendingMode(null);
  }, [pendingMode, currentMode, normalForm, batchForm, normalDefaultValues, batchDefaultValues, getDefaultActiveTab, activeSetValue]);

  // Cancel switch
  const cancelModeSwitch = useCallback(() => {
    setShowModeConfirm(false);
    setPendingMode(null);
  }, []);

  // Determine when the detach modal should render
  // let detachModalContext: {
  //   batchAssets: Asset[];
  //   originalQuantity: number;
  //   pendingData: CreateAssetFormData;
  // } | null = null;

  // if (
  //   currentMode === 'batch' &&
  //   editingAsset?.batchId &&
  //   Array.isArray(batchAssets) &&
  //   typeof originalQuantity === "number" &&
  //   pendingData !== null
  // ) {
  //   detachModalContext = {
  //     batchAssets,
  //     originalQuantity,
  //     pendingData,
  //   };
  // }

  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        {/* Header/Title */}
        <div className="flex h-full flex-col gap-6 p-2 md:p-6">
          <TabHeader 
            title={title}
            subtitle={isEditMode ? "Update the asset information." : "Fill in the details to create a new asset."}
            actions={[
              {
                label: "Back",
                onAction: onBack,
                variant: "outline",
                size: "default",
              },
              ...(modeToggleAction ? [modeToggleAction] : []),
            ]}
          />
        </div>

        {/* Split into left and right */}
        <div className="flex flex-row gap-6 items-stretch px-6 pb-10">
          {/* Left: Existing create asset forms */}
          <div className="flex-1 min-w-0">
             <form
               ref={formRef}
               onSubmit={(event) => {
                 void activeHandleSubmit(onSubmit)(event);
               }}
               className="space-y-6"
             >
              {/* Main Form Fields */}
              <Card className="p-6">
                {/* Inactive Status Section - Compact */}
                <div className="flex justify-end mb-6">
                  <Card className="px-3 py-1 m-0 bg-surfaceContainerLowest">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Option
                          type="checkbox"
                          {...activeRegister("inactive")}
                          checked={inactive}
                        />
                        <label className="body-small text-onSurfaceVariant whitespace-nowrap">Inactive</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <SemiDatePicker
                          inputType="date"
                          value={activeWatch("inactiveStart")}
                          onChange={(date) => {
                            let formatted = '';
                            if (typeof date === 'string') {
                              formatted = date;
                            } else if (date instanceof Date) {
                              formatted = date.toISOString().split('T')[0];
                            }
                            activeSetValue("inactiveStart", formatted);
                          }}
                          className="border-none w-36"
                          placeholder="Start Date"
                          disabled={!inactive}
                        />
                        <span className="body-small text-onSurfaceVariant">to</span>
                        <SemiDatePicker
                          inputType="date"
                          value={activeWatch("inactiveEnd")}
                          onChange={(date) => {
                            let formatted = '';
                            if (typeof date === 'string') {
                              formatted = date;
                            } else if (date instanceof Date) {
                              formatted = date.toISOString().split('T')[0];
                            }
                            activeSetValue("inactiveEnd", formatted);
                          }}
                          className="border-none w-36"
                          placeholder="End Date"
                          disabled={!inactive}
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Batch ID or Asset ID */}
                  {currentMode === 'batch' ? (
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Batch ID <span className="text-error">*</span>
                    </label>
                    <Input {...activeRegister("code")} placeholder="Enter Batch ID" />
                    {activeErrors.code && (
                      <span className="body-small text-error mt-1 block">{activeErrors.code.message}</span>
                    )}
                  </div>
                  ) : (
                  <>
                  {/* Asset ID */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Asset ID <span className="text-error">*</span>
                    </label>
                    <Input {...activeRegister("code")} placeholder="Enter Asset ID" />
                    {activeErrors.code && (
                      <span className="body-small text-error mt-1 block">{activeErrors.code.message}</span>
                      )}
                    </div>
                  </>
                  )}

                  {/* Asset Name / Batch Name */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      {currentMode === 'batch' ? 'Batch Name' : 'Asset Name'} <span className="text-error">*</span>
                    </label>
                    <Input {...activeRegister("assetName")} placeholder="e.g., Dell Laptop, HP Printer" />
                    {activeErrors.assetName && (
                      <span className="body-small text-error mt-1 block">{activeErrors.assetName.message}</span>
                    )}
                  </div>

                  {/* Asset Group */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Asset Group <span className="text-error">*</span>
                    </label>
                    <SelectDropdown
                      className="w-full"
                      value={assetGroupValue}
                      placeholder="-- Choose Asset Group --"
                      options={assetGroups}
                      onChange={(nextValue) => {
                        activeSetValue("assetGroup", nextValue, { shouldValidate: true});
                      }}
                      matchTriggerWidth={false}
                      contentClassName="w-fit"
                    />
                    {activeErrors.assetGroup && (
                      <span className="body-small text-error mt-1 block">{activeErrors.assetGroup.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {currentMode === 'batch' && !isEditMode ? (
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Assets in Batch <span className="text-error">*</span>
                    </label>
                    <Input
                      type="number"
                      {...activeRegister("quantity", { valueAsNumber: true })}
                      min="1"
                      max="999"
                    />
                    {activeErrors.quantity && (
                      <span className="body-small text-error mt-1 block">{activeErrors.quantity.message}</span>
                    )}
                  </div>
                  ) : currentMode === 'batch' && isEditMode ? (
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Assets in Batch <span className="text-error">*</span>
                    </label>
                    <Input
                      type="number"
                      {...activeRegister("quantity", { valueAsNumber: true })}
                      min="1"
                      max="999"
                    />
                    {activeErrors.quantity && (
                      <span className="body-small text-error mt-1 block">{activeErrors.quantity.message}</span>
                    )}
                    {originalQuantity !== undefined && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Current: {originalQuantity} | Changing to: {activeWatch("quantity")}
                      </p>
                    )}
                  </div>
                  ) : null
                  }

                  {/* Units per Asset */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Units per Asset <span className="text-error">*</span>
                    </label>
                    <Input
                      type="number"
                      {...activeRegister("quantityPerUnit", { valueAsNumber: true })}
                      min="1"
                      max="999"
                    />
                    {activeErrors.quantityPerUnit && (
                      <span className="body-small text-error mt-1 block">{activeErrors.quantityPerUnit.message}</span>
                    )}
                  </div>

                  {/* Total Cost */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">Total Cost</label>
                    <Input {...activeRegister("cost")} placeholder="0.00" />
                    {activeErrors.cost && (
                      <span className="body-small text-error mt-1 block">{activeErrors.cost.message}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-onSurface">Description</label>
                  <TextArea {...activeRegister("description")} placeholder="Enter description" rows={3} />
                </div>

                {/* Dates - hidden in batch mode */}
                {currentMode !== 'batch' && (
                  <div className={`grid grid-cols-1 gap-4 ${activeTab === "depreciation" ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                    <div>
                      <label className="text-sm font-medium text-onSurface mb-2 flex items-center gap-1">
                        Purchase Date
                        <Tooltip
                          text="The date on the purchase invoice. Used for accounting records."
                          positionX="right"
                          positionY="below"
                        />
                      </label>
                      <Controller
                        name="purchaseDate"
                        control={activeControl}
                        render={({ field }) => (
                          <SemiDatePicker
                            inputType="date"
                            value={field.value}
                            onChange={(date) => {
                              let formatted = '';
                              if (typeof date === 'string') {
                                formatted = date;
                              } else if (date instanceof Date) {
                                formatted = date.toISOString().split('T')[0];
                              }
                              field.onChange(formatted);
                            }}
                            className="border-none"
                            errorMsg={activeErrors.purchaseDate?.message}
                            placeholder="dd/mm/yyyy"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium  text-onSurface mb-2 flex items-center gap-1">
                        Date First Used / Depreciation Start Date
                        <Tooltip
                          text="The date the asset is ready and first used in the business. Used for Capital Allowance calculation. Also indicates the start of depreciation."
                          positionX="right"
                          positionY="below"
                        />
                      </label>
                      <Controller
                        name="acquireDate"
                        control={activeControl}
                        render={({ field }) => (
                          <SemiDatePicker
                            inputType="date"
                            value={field.value}
                            onChange={(date) => {
                              let formatted = '';
                              if (typeof date === 'string') {
                                formatted = date;
                              } else if (date instanceof Date) {
                                formatted = date.toISOString().split('T')[0];
                              }
                              field.onChange(formatted);
                            }}
                            className="border-none"
                            errorMsg={activeErrors.acquireDate?.message}
                            placeholder="dd/mm/yyyy"
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Tabs */}
              <Tabs
                key={`tabs-${currentMode}`}
                tabs={tabs}
                variant={"underline"}
                className="m-0"
                defaultValue={activeTab}
                onValueChange={setActiveTab}
              />
            </form>
          </div>

          {/* Right: Depreciation Schedule */}
          {activeTab === "depreciation" && currentMode === 'normal' && ( // Only in normal mode
            <div className="flex-1 max-w-md">
              <DepreciationSchedulePanel view={depreciationScheduleView} />
            </div>
          )}
        </div>  

        {/* Detach Modal - unchanged */}
        {detachModalContext && (
          <BatchDetachModal
            open={showDetachModal}
            onOpenChange={setShowDetachModal}
            batchAssets={detachModalContext.batchAssets}
            numToDetach={detachModalContext.originalQuantity - detachModalContext.pendingData.quantity}
            onConfirm={handleBatchConfirmDetach}
          />
        )}

        {/* Mode Confirmation Modal */}
        {showModeConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <h3 className="title-small text-onSurface mb-2">Confirm Mode Switch</h3>
              <p className="body-medium text-onSurfaceVariant mb-4">
                Switching to {pendingMode === 'batch' ? 'batch' : 'normal'} mode will clear the current form data, including tabs. Continue?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelModeSwitch}>
                  Cancel
                </Button>
                <Button onClick={confirmModeSwitch}>
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="flex justify-end items-center gap-4 sticky bottom-0 bg-surface px-6 py-4 border-t border-outline shadow-lg -mb-5 -mx-5 mt-0 w-auto">
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : (isEditMode ? "Update Asset" : "Create Asset")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssetForm;