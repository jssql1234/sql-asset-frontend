import React, { useState, useRef, useImperativeHandle, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVirtualizer } from "@tanstack/react-virtual";
import { createAssetFormSchema, type CreateAssetFormData } from "../zod/createAssetForm";
import { Option, Tabs, type TabItem, Button, Card } from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { Tooltip } from "@/components/ui/components/Tooltip";
import { useToast } from "@/components/ui/components/Toast/useToast";
import TabHeader from "@/components/TabHeader";
import { SerialNumberTab } from "./SerialNumberTab";
import { DepreciationTab, type DepreciationScheduleViewState } from "./DepreciationTab";
import { AllowanceTab } from "./AllowanceTab";
import { HirePurchaseTab } from "./HirePurchaseTab";
import type { UseFormRegister, UseFormSetValue, UseFormWatch, Control, FieldErrors } from "react-hook-form";
import type { Asset } from "@/types/asset";
import SelectDropdown, { type SelectDropdownOption } from "@/components/SelectDropdown";
import { usePermissions } from "@/hooks/usePermissions";

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
                    formatted = date.toLocaleDateString('en-CA');
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
                    formatted = date.toLocaleDateString('en-CA');
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
  const [batchMode, setBatchMode] = useState(false);
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depreciationScheduleView, setDepreciationScheduleView] = useState<DepreciationScheduleViewState | null>(null);
  const { hasPermission } = usePermissions();

  // Determine user role based on permissions or prop
  const isTaxAgent = hasPermission("processCA", "execute");
  const isAdmin = hasPermission("maintainItem", "execute") && hasPermission("processCA", "execute");

  // Use prop userRole if provided, otherwise determine from permissions
  const effectiveUserRole = userRole ?? (isAdmin ? 'admin' : (isTaxAgent ? 'taxAgent' : 'normal'));

  // Set default active tab based on effective user role
  const getDefaultActiveTab = () => {
    if (effectiveUserRole === 'taxAgent' || effectiveUserRole === 'admin') {
      return "allowance";
    }
    return "hire-purchase";
  };

  const [activeTab, setActiveTab] = useState(() => getDefaultActiveTab());

  const defaultValues: CreateAssetFormData = useMemo(() => ({
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
    code: "",
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateAssetFormData>({
    resolver: zodResolver(createAssetFormSchema),
    defaultValues,
  });

  // Populate form when editingAsset changes (following department pattern)
  useEffect(() => {
    if (editingAsset) {
      reset({
        code: editingAsset.id,
        batchID: editingAsset.batchId,
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
    } else {
      reset(defaultValues);
    }
  }, [editingAsset, reset, defaultValues]);

  // Determine if we're in edit mode
  const isEditMode = Boolean(editingAsset);
  const title = isEditMode ? "Edit Asset" : "Create Asset";

  // Memoize the serial numbers change handler to prevent unnecessary re-renders
  const handleSerialNumbersChange = useCallback((serialNumbers: SerialNumberData[]) => {
    setValue("serialNumbers", serialNumbers);
  }, [setValue]);

  // Watch form values for reactivity
  const serialNumbersValue = watch("serialNumbers");
  const quantity = watch("quantity");
  const quantityPerUnit = watch("quantityPerUnit");
  const inactive = watch("inactive");

  // Memoize serialNumbers to prevent unnecessary re-renders
  const memoizedSerialNumbers = useMemo(() => serialNumbersValue, [serialNumbersValue]);

  useEffect(() => {
    if (inactive) {
      const today = new Date().toISOString().split('T')[0];
      setValue("inactiveStart", today);
    } else {
      setValue("inactiveStart", "");
    }
  }, [inactive, setValue]);


  const formRef = useRef<HTMLFormElement>(null);

  useImperativeHandle(ref, () => ({
    submit: () => formRef.current?.requestSubmit(),
  }));

  const onSubmit = (data: CreateAssetFormData): void => {
    // Handle form submission
    onSuccess?.(data);
  };

  const handleFakeSubmit = () => {
    setIsSubmitting(() => true);
    // Simulate API call
    setTimeout(() => {
      addToast({
        variant: "success",
        title: isEditMode ? "Asset Updated (Fake)" : "Asset Created (Fake)",
        description: "This is a fake submission for testing purposes.",
        duration: 5000,
      });
      setIsSubmitting(() => false);
      onBack?.();
    }, 1000);
  };


  // Mock data for dropdowns
  const assetGroups: SelectDropdownOption[] = [
    { value: "", label: "-- Choose Asset Group --" },
    { value: "computers", label: "Computers" },
    { value: "furniture", label: "Furniture" },
    { value: "vehicles", label: "Vehicles" },
  ];

  const assetGroupValue = watch("assetGroup", "");

  // Define tabs based on batch mode and user permissions
  const commonTabProps: TabProps = { register, setValue, watch, control, errors, selectedTaxYear, taxYearOptions };

  const tabs: TabItem[] = batchMode
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
              isBatchMode={batchMode}
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
              control={control}
              watch={watch}
              setValue={setValue}
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
              isBatchMode={batchMode}
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
              control={control}
              watch={watch}
              setValue={setValue}
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
              isBatchMode={batchMode}
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

  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        {/* Header/Title */}
        <div className="flex h-full flex-col gap-6 p-2 md:p-6">
          <TabHeader title={title}
          subtitle={isEditMode ? "Update the asset information." : "Fill in the details to create a new asset."}
          actions={[
            {
              label: "Back",
              onAction: onBack,
              variant: "outline",
              size: "default",
            },
            {
              label: batchMode ? "Exit Batch" : "Batch",
              onAction: () => {
                const newBatchMode = !batchMode;
                setBatchMode(newBatchMode);
                if (newBatchMode) {
                  const batchModeTabs = ["allocation", "serial-no", "warranty"];
                  if (!batchModeTabs.includes(activeTab)) {
                    setActiveTab("allocation");
                  }
                } else {
                  const normalModeTabs = ["allowance", "hire-purchase", "depreciation", "allocation", "serial-no", "warranty"];
                  if (!normalModeTabs.includes(activeTab)) {
                    setActiveTab("allowance");
                  }
                }
              },
              variant: batchMode ? "destructive" : "default",
              size: "sm",
              position: "inline",
              tooltip: batchMode ? "Exit batch mode" : "Enter batch mode",
            },
            ]}
            />
        </div>

        {/* Split into left and right */}
        <div className="flex flex-row gap-6 items-stretch px-6 pb-10">
          {/* Left: Existing create asset forms */}
          <div className="flex-1 min-w-0">
             <form ref={formRef} onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit)(e); }} className="space-y-6">
              {/* Main Form Fields */}
              <Card className="p-6">
                {/* Inactive Status Section - Compact */}
                <div className="flex justify-end mb-6">
                  <Card className="px-3 py-1 m-0 bg-surfaceContainerLowest">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Option
                          type="checkbox"
                          {...register("inactive")}
                          checked={inactive}
                        />
                        <label className="body-small text-onSurfaceVariant whitespace-nowrap">Inactive</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <SemiDatePicker
                          inputType="date"
                          value={watch("inactiveStart")}
                          onChange={(date) => {
                            let formatted = '';
                            if (typeof date === 'string') {
                              formatted = date;
                            } else if (date instanceof Date) {
                              formatted = date.toLocaleDateString('en-CA');
                            }
                            setValue("inactiveStart", formatted);
                          }}
                          className="border-none w-36"
                          placeholder="Start Date"
                          disabled={!inactive}
                        />
                        <span className="body-small text-onSurfaceVariant">to</span>
                        <SemiDatePicker
                          inputType="date"
                          value={watch("inactiveEnd")}
                          onChange={(date) => {
                            let formatted = '';
                            if (typeof date === 'string') {
                              formatted = date;
                            } else if (date instanceof Date) {
                              formatted = date.toLocaleDateString('en-CA');
                            }
                            setValue("inactiveEnd", formatted);
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
                  {/* Batch ID */}
                  {batchMode ? (
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Batch ID <span className="text-error">*</span>
                    </label>
                    <Input {...register("code")} placeholder="Enter Batch ID" />
                    {errors.code && (
                      <span className="body-small text-error mt-1 block">{errors.code.message}</span>
                    )}
                  </div>
                  ) : (
                  <>
                  {/* Asset ID */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Asset ID <span className="text-error">*</span>
                    </label>
                    <Input {...register("code")} placeholder="Enter Asset ID" />
                    {errors.code && (
                      <span className="body-small text-error mt-1 block">{errors.code.message}</span>
                      )}
                    </div>
                  </>
                  )}

                  {/* Asset Name */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Asset Name <span className="text-error">*</span>
                    </label>
                    <Input {...register("assetName")} placeholder="e.g., Dell Laptop, HP Printer" />
                    {errors.assetName && (
                      <span className="body-small text-error mt-1 block">{errors.assetName.message}</span>
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
                        setValue("assetGroup", nextValue, { shouldValidate: true});
                      }}
                      matchTriggerWidth={false}
                      contentClassName="w-fit"
                    />
                    {errors.assetGroup && (
                      <span className="body-small text-error mt-1 block">{errors.assetGroup.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {batchMode && (
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Assets in Batch <span className="text-error">*</span>
                    </label>
                    <Input
                      type="number"
                      {...register("quantity", { valueAsNumber: true })}
                      min="1"
                      max="999"
                    />
                    {errors.quantity && (
                      <span className="body-small text-error mt-1 block">{errors.quantity.message}</span>
                    )}
                  </div>
                  )}

                  {/* Units per Asset */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">
                      Units per Asset <span className="text-error">*</span>
                    </label>
                    <Input
                      type="number"
                      {...register("quantityPerUnit", { valueAsNumber: true })}
                      min="1"
                      max="999"
                    />
                    {errors.quantityPerUnit && (
                      <span className="body-small text-error mt-1 block">{errors.quantityPerUnit.message}</span>
                    )}
                  </div>

                  {/* Total Cost */}
                  <div>
                    <label className="block text-sm font-medium text-onSurface">Total Cost</label>
                    <Input {...register("cost")} placeholder="0.00" />
                    {errors.cost && (
                      <span className="body-small text-error mt-1 block">{errors.cost.message}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-onSurface">Description</label>
                  <TextArea {...register("description")} placeholder="Enter description" rows={3} />
                </div>

                {/* Dates */}
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
                              formatted = date.toLocaleDateString('en-CA');
                            }
                            field.onChange(formatted);
                          }}
                          className="border-none"
                          errorMsg={errors.purchaseDate?.message}
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
                              formatted = date.toLocaleDateString('en-CA');
                            }
                            field.onChange(formatted);
                          }}
                          className="border-none"
                          errorMsg={errors.acquireDate?.message}
                          placeholder="dd/mm/yyyy"
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>

              {/* Tabs */}
              <Tabs
                key={`tabs-${batchMode ? 'batch' : 'normal'}`}
                tabs={tabs}
                variant={"underline"}
                className="m-0"
                defaultValue={activeTab}
                onValueChange={setActiveTab}
              />
            </form>
          </div>

          {/* Right: Reserved section - Only show when Depreciation tab is active */}
          {activeTab === "depreciation" && (
            <div className="flex-1 max-w-md">
              <DepreciationSchedulePanel view={depreciationScheduleView} />
            </div>
          )}
        </div>  
      </div>
      {/* Footer */}
      <div className="flex justify-end gap-4 sticky bottom-0 bg-surface px-6 py-4 border-t border-outline shadow-lg -mb-5 -mx-5 mt-0 w-auto">
        <Button onClick={handleFakeSubmit} disabled={isSubmitting} variant="outline" className="bg-warning text-onWarning hover:bg-warning/90">
          {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : "Fake Submit (Test)"}
        </Button>
        <Button onClick={() => formRef.current?.requestSubmit()} disabled={isSubmitting}>
          {isEditMode ? "Update Asset" : "Create Asset"}
        </Button>
      </div>
    </div>
  );
};

export default AssetForm;