import React, { useState, useRef, useImperativeHandle, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAssetFormSchema, type CreateAssetFormData } from "../zod/createAssetForm";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Option,
  Tabs,
  type TabItem,
  Button,
  Card,
} from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { Tooltip } from "@/components/ui/components/Tooltip";
import { ChevronDown } from "@/assets/icons";
import { useToast } from "@/components/ui/components/Toast/useToast";
import TabHeader from "@/components/TabHeader";
import { SerialNumberTab } from "./SerialNumberTab";
import type { UseFormRegister, UseFormSetValue, UseFormWatch, Control, FieldErrors } from "react-hook-form";

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
}

interface CreateAssetProps {
  onSuccess?: (data: CreateAssetFormData) => void;
  onBack?: () => void;
}

interface CreateAssetRef {
  submit: () => void;
}

// Tab Components
const AllowanceTab: React.FC<TabProps> = ({ register, setValue, watch }) => {
  return (
    <Card className="p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">CA Asset Group</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("caAssetGroup") ?? "-- Choose Group --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("caAssetGroup", "building"); }}>Building</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("caAssetGroup", "machinery"); }}>Machinery</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("caAssetGroup", "vehicles"); }}>Vehicles</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Allowance Class</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("allowanceClass") ?? "-- Choose Code --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("allowanceClass", "class1"); }}>Class 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("allowanceClass", "class2"); }}>Class 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Sub Class</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("subClass") ?? "-- Choose Type --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("subClass", "type1"); }}>Type 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("subClass", "type2"); }}>Type 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">IA Rate</label>
          <Input {...register("iaRate")} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">AA Rate</label>
          <Input {...register("aaRate")} readOnly />
        </div>
        <div className="flex items-center gap-2 mt-7">
          <Option type="checkbox" {...register("aca")} checked={watch("aca")} />
          <label className="body-small text-onSurfaceVariant">ACA</label>
        </div>
      </div>

      {watch("caAssetGroup") === "vehicles" && (
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-2">
            <Option type="checkbox" {...register("extraCheckbox")} checked={watch("extraCheckbox")} />
            <label className="body-small text-onSurfaceVariant">Motor Vehicle</label>
          </div>
          {watch("extraCheckbox") && (
            <div className="ml-6 space-y-3">
              <div className="flex items-center gap-2">
                <Option type="checkbox" {...register("extraCommercial")} checked={watch("extraCommercial")} />
                <label className="body-small text-onSurfaceVariant">Commercial Use</label>
              </div>
              <div className="flex items-center gap-2">
                <Option type="checkbox" {...register("extraNewVehicle")} checked={watch("extraNewVehicle")} />
                <label className="body-small text-onSurfaceVariant">New Vehicle</label>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Qualify Amount (QE)</label>
          <Input {...register("qeValue")} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Controlled Transfer In RE</label>
          <Input {...register("residualExpenditure")} placeholder="0.00" />
        </div>
      </div>
    </Card>
  );
};

const HirePurchaseTab: React.FC<TabProps> = ({ register, setValue, watch, control }) => {
  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Option type="checkbox" {...register("hpCheck")} />
        <label className="body-small text-onSurfaceVariant">Hire Purchase</label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">HP Start Date</label>
          <Controller
            name="hpStartDate"
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
          <label className="block text-sm font-medium text-onSurface">No. Instalment (months)</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("hpInstalment")}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("hpInstalment", "12"); }}>12</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("hpInstalment", "24"); }}>24</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("hpInstalment", "36"); }}>36</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("hpInstalment", "48"); }}>48</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("hpInstalment", "60"); }}>60</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("hpInstalment", "other"); }}>Other</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {watch("hpInstalment") === "other" && (
          <div>
            <label className="block text-sm font-medium text-onSurface">Custom Instalment</label>
            <Input type="number" {...register("hpInstalmentUser")} />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-onSurface">Deposit Amount</label>
          <Input {...register("hpDeposit")} placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Interest Rate (%)</label>
          <Input type="number" {...register("hpInterest")} min="0" max="100" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Finance</label>
          <Input {...register("hpFinance")} placeholder="0.00" />
        </div>
      </div>
    </Card>
  );
};

const DepreciationTab: React.FC<TabProps> = ({ register, setValue, watch }) => {
  return (
    <Card className="p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Depreciation Method</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button  variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("depreciationMethod")}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("depreciationMethod", "Straight Line"); }}>Straight Line</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("depreciationMethod", "Manual"); }}>Manual</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Frequency</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("depreciationFrequency") || "- Choose Frequency -"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit">
              <DropdownMenuItem onClick={() => { setValue("depreciationFrequency", "Yearly"); }}>Yearly</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("depreciationFrequency", "Monthly"); }}>Monthly</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Useful Life (Years)</label>
          <Input type="number" {...register("usefulLife", { valueAsNumber: true })} min="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Residual Value</label>
          <Input {...register("residualValue")} placeholder="0.00" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Depreciation Rate</label>
          <Input {...register("depreciationRate")} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Total Depreciation</label>
          <Input {...register("totalDepreciation")} readOnly />
        </div>
      </div>
    </Card>
  );
};


const AllocationTab: React.FC<TabProps> = ({ register, setValue, watch }) => {
  return (
    <Card className="p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Branch</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("branch") ?? "-- Select Branch --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("branch", "HQ"); }}>Headquarters</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("branch", "KL"); }}>Kuala Lumpur Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("branch", "JB"); }}>Johor Bahru Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("branch", "PG"); }}>Penang Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("branch", "KT"); }}>Kuantan Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("branch", "KC"); }}>Kuching Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("branch", "KK"); }}>Kota Kinabalu Branch</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Department</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("department") ?? "-- Select Department --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("department", "IT"); }}>Information Technology</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("department", "HR"); }}>Human Resources</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("department", "FIN"); }}>Finance</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("department", "OPS"); }}>Operations</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("department", "MKT"); }}>Marketing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("department", "ADM"); }}>Administration</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("department", "LEG"); }}>Legal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("department", "AUD"); }}>Audit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Location</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("location") ?? "-- Select Location --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("location", "HQ-L1"); }}>HQ - Level 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "HQ-L2"); }}>HQ - Level 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "HQ-L3"); }}>HQ - Level 3</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "HQ-L4"); }}>HQ - Level 4</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "HQ-L5"); }}>HQ - Level 5</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "KL-L1"); }}>KL Branch - Level 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "KL-L2"); }}>KL Branch - Level 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "JB-L1"); }}>JB Branch - Level 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "JB-L2"); }}>JB Branch - Level 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "PG-L1"); }}>Penang Branch - Level 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "PG-L2"); }}>Penang Branch - Level 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "WAREHOUSE"); }}>Warehouse</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "STORAGE"); }}>Storage Room</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "MEETING-RM"); }}>Meeting Room</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("location", "CONF-RM"); }}>Conference Room</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Person in Charge</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger>
              <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                {watch("personInCharge") ?? "-- Select Person --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP001"); }}>John Doe (EMP001) - IT Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP002"); }}>Jane Smith (EMP002) - HR Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP003"); }}>Michael Chen (EMP003) - Finance Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP004"); }}>Sarah Johnson (EMP004) - Operations Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP005"); }}>David Lee (EMP005) - IT Technician</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP006"); }}>Emma Wilson (EMP006) - HR Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP007"); }}>Robert Kim (EMP007) - Finance Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP008"); }}>Lisa Brown (EMP008) - Admin Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP009"); }}>Kevin Tan (EMP009) - Operations Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP010"); }}>Amy Wong (EMP010) - Marketing Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP011"); }}>Thomas Lim (EMP011) - Legal Officer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setValue("personInCharge", "EMP012"); }}>Rachel Ng (EMP012) - Audit Officer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

const CreateAsset = ({ ref, ...props }: CreateAssetProps & { ref?: React.RefObject<CreateAssetRef | null> }) => {
  const { onSuccess, onBack } = props;
  const [batchMode, setBatchMode] = useState(false);
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("allowance");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateAssetFormData>({
    resolver: zodResolver(createAssetFormSchema),
    defaultValues: {
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
    },
  });

  // Memoize the serial numbers change handler to prevent unnecessary re-renders
  const handleSerialNumbersChange = useCallback((serialNumbers: SerialNumberData[]) => {
    setValue("serialNumbers", serialNumbers);
  }, [setValue]);

  const serialNumbersValue = watch("serialNumbers");
  const memoizedSerialNumbers = useMemo(() => serialNumbersValue, [serialNumbersValue]);

  const inactive = watch("inactive");

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
    console.log("Form data:", data);
    // Handle form submission
    onSuccess?.(data);
  };

  const handleFakeSubmit = () => {
    setIsSubmitting(() => true);
    // Simulate API call
    setTimeout(() => {
      addToast({
        variant: "success",
        title: "Asset Created (Fake)",
        description: "This is a fake submission for testing purposes.",
        duration: 5000,
      });
      setIsSubmitting(() => false);
      onBack?.();
    }, 1000);
  };



  // Mock data for dropdowns
  const assetGroups = [
    { value: "", label: "-- Choose Asset Group --" },
    { value: "computers", label: "Computers" },
    { value: "furniture", label: "Furniture" },
    { value: "vehicles", label: "Vehicles" },
  ];

  const tabs: TabItem[] = [
    {
      label: "Allowance",
      value: "allowance",
      content: <AllowanceTab register={register} setValue={setValue} watch={watch} control={control} errors={errors} />,
    },
    {
      label: "Hire Purchase",
      value: "hire-purchase",
      content: <HirePurchaseTab register={register} setValue={setValue} watch={watch} control={control} errors={errors} />,
    },
    {
      label: "Depreciation",
      value: "depreciation",
      content: <DepreciationTab register={register} setValue={setValue} watch={watch} control={control} errors={errors} />,
    },
    {
      label: "Allocation",
      value: "allocation",
      content: <AllocationTab register={register} setValue={setValue} watch={watch} control={control} errors={errors} />,
    },
    {
      label: "Serial No",
      value: "serial-no",
      content: (
        <SerialNumberTab
          quantity={watch("quantity")}
          quantityPerUnit={watch("quantityPerUnit")}
          isBatchMode={batchMode}
          serialNumbers={memoizedSerialNumbers}
          onSerialNumbersChange={handleSerialNumbersChange}
        />
      ),
    },
    {
      label: "Warranty",
      value: "warranty",
      content: <WarrantyTab register={register} setValue={setValue} watch={watch} control={control} errors={errors} />,
    },
  ];

  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        {/* Header/Title */}
        <div className="flex h-full flex-col gap-6 p-2 md:p-6">
          <TabHeader title="Create Asset"
          subtitle="Fill in the details to create a new asset."
          actions={[
            {
              label: "Back",
              onAction: onBack,
              variant: "outline",
              size: "default",
            },
            {
              label: batchMode ? "Exit Batch" : "Batch",
              onAction: () => { setBatchMode((prev) => !prev); },
              variant: batchMode ? "destructive" : "default",
              size: "sm",
              position: "inline",
              tooltip: batchMode ? "Exit batch mode" : "Enter batch mode",
            },
            ]}
            />
        </div>

        {/* Split into left and right */}
        <div className="flex flex-row gap-6 items-stretch px-6 pb-20">
          {/* Left: Existing create asset forms */}
          <div className="flex-1 min-w-0">
            <form ref={formRef} onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} action="" className="space-y-6">
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
                              formatted = date.toISOString().split('T')[0];
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
                              formatted = date.toISOString().split('T')[0];
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
                    <DropdownMenu className="w-full">
                      <DropdownMenuTrigger>
                        <Button variant="dropdown" size="dropdown" className="w-full justify-between">
                          {assetGroups.find(g => g.value === watch("assetGroup"))?.label ?? "-- Choose Asset Group --"}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-fit">
                        {assetGroups.map((group) => (
                          <DropdownMenuItem
                            key={group.value}
                            onClick={() => { setValue("assetGroup", group.value); }}
                          >
                            {group.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                              formatted = date.toISOString().split('T')[0];
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
                              formatted = date.toISOString().split('T')[0];
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
              <Tabs tabs={tabs} variant={"underline"} className="m-0" onValueChange={setActiveTab} />
            </form>
          </div>

          {/* Right: Reserved section - Only show when Depreciation tab is active */}
          {activeTab === "depreciation" && (
            <div className="flex-1 max-w-md">
              <Card className="p-6 sticky top-24 shadow-md">
                <h3 className="title-small text-onSurface mb-2">Depreciation Schedule</h3>
                <p className="body-medium text-onSurfaceVariant">Work in Progress</p>
              </Card>
            </div>
          )}
        </div>

        {/* Footer (Create Asset) */}
        <div className="flex justify-end gap-4 sticky bottom-0 bg-surface px-6 py-4 border-t border-outline shadow-lg">
          <Button onClick={handleFakeSubmit} disabled={isSubmitting} variant="outline" className="bg-warning text-onWarning hover:bg-warning/90">{isSubmitting ? "Creating..." : "Fake Submit (Test)"}</Button>
          <Button onClick={() => formRef.current?.requestSubmit()} disabled={isSubmitting}>Create Asset</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAsset;