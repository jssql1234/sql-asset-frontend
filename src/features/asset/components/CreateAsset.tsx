import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
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
import { ChevronDown } from "@/assets/icons";
import { useToast } from "@/components/ui/components/Toast/useToast";

interface CreateAssetProps {
  onSuccess?: (data: CreateAssetFormData) => void;
  onBack?: () => void;
}

interface CreateAssetRef {
  submit: () => void;
}

// Tab Components
const AllowanceTab: React.FC<any> = ({ register, setValue, watch }) => {
  return (
    <Card className="p-6 -mt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">CA Asset Group</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("caAssetGroup") || "-- Choose Group --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("caAssetGroup", "building")}>Building</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("caAssetGroup", "machinery")}>Machinery</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("caAssetGroup", "vehicles")}>Vehicles</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Allowance Class</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("allowanceClass") || "-- Choose Code --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("allowanceClass", "class1")}>Class 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("allowanceClass", "class2")}>Class 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Sub Class</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("subClass") || "-- Choose Type --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("subClass", "type1")}>Type 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("subClass", "type2")}>Type 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">IA Rate</label>
          <Input {...register("iaRate")} readOnly />
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">AA Rate</label>
          <Input {...register("aaRate")} readOnly />
        </div>
        <div className="flex items-center gap-2">
          <Option type="checkbox" {...register("aca")} checked={watch("aca")} />
          <label className="body-small text-onSurfaceVariant">ACA</label>
        </div>
      </div>

      {watch("caAssetGroup") === "vehicles" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Option type="checkbox" {...register("extraCheckbox")} checked={watch("extraCheckbox")} />
            <label className="body-small text-onSurfaceVariant">Motor Vehicle</label>
          </div>
          {watch("extraCheckbox") && (
            <div className="ml-6 space-y-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Qualify Amount (QE)</label>
          <Input {...register("qeValue")} readOnly />
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Controlled Transfer In RE</label>
          <Input {...register("residualExpenditure")} placeholder="0.00" />
        </div>
      </div>
    </Card>
  );
};

const HirePurchaseTab: React.FC<any> = ({ register, setValue, watch, control }) => {
  return (
    <Card className="p-6 -mt-2">
      <div className="flex items-center gap-2">
        <Option type="checkbox" {...register("hpCheck")} />
        <label className="body-small text-onSurfaceVariant">Hire Purchase</label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">HP Start Date</label>
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
          <label className="body-small text-onSurfaceVariant block mb-1">No. Instalment (months)</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("hpInstalment") || "- Choose No. of Instalment -"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("hpInstalment", "12")}>12</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("hpInstalment", "24")}>24</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("hpInstalment", "36")}>36</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("hpInstalment", "48")}>48</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("hpInstalment", "60")}>60</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("hpInstalment", "other")}>Other</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {watch("hpInstalment") === "other" && (
          <div>
            <label className="body-small text-onSurfaceVariant block mb-1">Custom Instalment</label>
            <Input type="number" {...register("hpInstalmentUser")} />
          </div>
        )}
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Deposit Amount</label>
          <Input {...register("hpDeposit")} />
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Interest Rate (%)</label>
          <Input type="number" {...register("hpInterest")} min="0" max="100" />
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Finance</label>
          <Input {...register("hpFinance")} />
        </div>
      </div>
    </Card>
  );
};

const DepreciationTab: React.FC<any> = ({ register, setValue, watch }) => {
  return (
    <Card className="p-6 -mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Depreciation Method</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("depreciationMethod")}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("depreciationMethod", "Straight Line")}>Straight Line</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("depreciationMethod", "Manual")}>Manual</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Frequency</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("depreciationFrequency")}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("depreciationFrequency", "yearly")}>Yearly</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("depreciationFrequency", "monthly")}>Monthly</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Useful Life (Years)</label>
          <Input type="number" {...register("usefulLife", { valueAsNumber: true })} min="1" />
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Residual Value</label>
          <Input {...register("residualValue")} placeholder="0.00" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Depreciation Rate</label>
          <Input {...register("depreciationRate")} readOnly />
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Total Depreciation</label>
          <Input {...register("totalDepreciation")} readOnly />
        </div>
      </div>
    </Card>
  );
};


const AllocationTab: React.FC<any> = ({ register, setValue, watch }) => {
  return (
    <Card className="p-6 -mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Branch</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("branch") || "-- Select Branch --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("branch", "HQ")}>Headquarters</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("branch", "KL")}>Kuala Lumpur Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("branch", "JB")}>Johor Bahru Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("branch", "PG")}>Penang Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("branch", "KT")}>Kuantan Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("branch", "KC")}>Kuching Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("branch", "KK")}>Kota Kinabalu Branch</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Department</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("department") || "-- Select Department --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("department", "IT")}>Information Technology</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("department", "HR")}>Human Resources</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("department", "FIN")}>Finance</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("department", "OPS")}>Operations</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("department", "MKT")}>Marketing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("department", "ADM")}>Administration</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("department", "LEG")}>Legal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("department", "AUD")}>Audit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Location</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("location") || "-- Select Location --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("location", "HQ-L1")}>HQ - Level 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "HQ-L2")}>HQ - Level 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "HQ-L3")}>HQ - Level 3</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "HQ-L4")}>HQ - Level 4</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "HQ-L5")}>HQ - Level 5</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "KL-L1")}>KL Branch - Level 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "KL-L2")}>KL Branch - Level 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "JB-L1")}>JB Branch - Level 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "JB-L2")}>JB Branch - Level 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "PG-L1")}>Penang Branch - Level 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "PG-L2")}>Penang Branch - Level 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "WAREHOUSE")}>Warehouse</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "STORAGE")}>Storage Room</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "MEETING-RM")}>Meeting Room</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("location", "CONF-RM")}>Conference Room</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Person in Charge</label>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="w-full justify-between">
                {watch("personInCharge") || "-- Select Person --"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP001")}>John Doe (EMP001) - IT Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP002")}>Jane Smith (EMP002) - HR Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP003")}>Michael Chen (EMP003) - Finance Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP004")}>Sarah Johnson (EMP004) - Operations Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP005")}>David Lee (EMP005) - IT Technician</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP006")}>Emma Wilson (EMP006) - HR Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP007")}>Robert Kim (EMP007) - Finance Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP008")}>Lisa Brown (EMP008) - Admin Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP009")}>Kevin Tan (EMP009) - Operations Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP010")}>Amy Wong (EMP010) - Marketing Executive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP011")}>Thomas Lim (EMP011) - Legal Officer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setValue("personInCharge", "EMP012")}>Rachel Ng (EMP012) - Audit Officer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        <label className="body-small text-onSurfaceVariant block mb-1">Additional Notes</label>
        <TextArea {...register("allocationNotes")} placeholder="Any additional information about the asset allocation" rows={3} />
      </div>
    </Card>
  );
};

const SerialNoTab: React.FC<any> = ({ setValue, watch }) => {
  const [serialNumbers, setSerialNumbers] = useState<string[]>(watch("serialNumbers") || []);

  const addSerialNumber = () => {
    setSerialNumbers([...serialNumbers, ""]);
  };

  const updateSerialNumber = (index: number, value: string) => {
    const updated = [...serialNumbers];
    updated[index] = value;
    setSerialNumbers(updated);
    setValue("serialNumbers", updated);
  };

  const removeSerialNumber = (index: number) => {
    const updated = serialNumbers.filter((_, i) => i !== index);
    setSerialNumbers(updated);
    setValue("serialNumbers", updated);
  };

  return (
    <Card className="p-6 -mt-2">
      <div className="flex justify-between items-center">
        <label className="body-small text-onSurfaceVariant">Serial Numbers</label>
        <Button type="button" onClick={addSerialNumber}>Add Serial Number</Button>
      </div>
      <div className="space-y-2">
        {serialNumbers.map((serial, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={serial}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSerialNumber(index, e.target.value)}
              placeholder="Enter serial number"
            />
            <Button type="button" variant="destructive" onClick={() => removeSerialNumber(index)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

const WarrantyTab: React.FC<any> = ({ register, control }) => {
  return (
    <Card className="p-6 -mt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Warranty Provider</label>
          <Input {...register("warrantyProvider")} placeholder="Enter warranty provider" />
        </div>
        <div>
          <label className="body-small text-onSurfaceVariant block mb-1">Start Date</label>
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
          <label className="body-small text-onSurfaceVariant block mb-1">End Date</label>
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
              />
            )}
          />
        </div>
      </div>
      <div>
        <label className="body-small text-onSurfaceVariant block mb-1">Notes</label>
        <TextArea {...register("warrantyNotes")} rows={3} placeholder="Additional warranty notes" />
      </div>
    </Card>
  );
};

const CreateAsset = forwardRef<CreateAssetRef, CreateAssetProps>((props, ref) => {
  const { onSuccess, onBack } = props;
  const [batchMode] = useState(false);
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      depreciationFrequency: "yearly",
      usefulLife: 10,
      aca: false,
      extraCheckbox: false,
      extraCommercial: false,
      extraNewVehicle: false,
      serialNumbers: [],
    },
  });

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

  const onSubmit = (data: CreateAssetFormData) => {
    console.log("Form data:", data);
    // Handle form submission
    onSuccess?.(data);
  };

  const handleFakeSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      addToast({
        variant: "success",
        title: "Asset Created (Fake)",
        description: "This is a fake submission for testing purposes.",
        duration: 5000,
      });
      setIsSubmitting(false);
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
      content: <SerialNoTab register={register} setValue={setValue} watch={watch} control={control} errors={errors} />,
    },
    {
      label: "Warranty",
      value: "warranty",
      content: <WarrantyTab register={register} setValue={setValue} watch={watch} control={control} errors={errors} />,
    },
  ];

  return (
    <div className="bg-surface px-6">
      <div className="mx-auto">
        {/* Header/Title */}
        <div className="mb-4 flex items-center justify-between sticky top-0 bg-surface z-10 py-4 border-b border-outline">
          <h2 className="title-medium text-onSurface">Create Asset</h2>
          {onBack && <Button onClick={onBack}>Back</Button>}
        </div>

        {/* Split into left and right */}
        <div className="flex flex-row gap-6 items-stretch">
          {/* Left: Existing create asset forms */}
          <div className="flex-2">
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} action="" className="space-y-6">
              {/* Main Form Fields */}
              <Card className="p-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="px-4 pt-3 pb-2 col-span-2 w-fit justify-self-end m-0">
                <div className="flex justify-end gap-4">
                  <div className="flex items-center gap-2">
                    <Option
                      type="checkbox"
                      {...register("inactive")}
                      checked={inactive}
                    />
                    <label className="body-small text-onSurfaceVariant">Inactive</label>
                  </div>
                    <div className="flex gap-4">
                      <div>
                        {/* <label className="body-small text-onSurfaceVariant block mb-1">Start:</label> */}
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
                          className="border-none"
                          placeholder={"Start Date"}
                          disabled={!inactive}
                        />
                      </div>
                      <label className="body-small text-onSurfaceVariant self-center">to</label>
                      <div>
                        {/* <label className="body-small text-onSurfaceVariant block mb-1">End:</label> */}
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
                          className="border-none"
                          placeholder={"End Date"}
                          disabled={!inactive}
                        />
                      </div>
                    </div>
                </div>
              </Card>
                  {/* Batch ID - conditional */}
                  {batchMode && (
                    <div>
                      <label className="body-small text-onSurfaceVariant block mb-1">
                        Batch ID <span className="text-error">*</span>
                      </label>
                      <Input {...register("batchID")} placeholder="Enter Batch ID" />
                      {errors.batchID && (
                        <span className="body-small text-error">{errors.batchID.message}</span>
                      )}
                    </div>
                  )}

                  {/* Asset ID */}
                  <div>
                    <label className="body-small text-onSurfaceVariant block mb-1">
                      Asset ID <span className="text-error">*</span>
                    </label>
                    <Input {...register("code")} placeholder="Enter Asset ID" />
                    {errors.code && (
                      <span className="body-small text-error">{errors.code.message}</span>
                    )}
                  </div>

                  {/* Asset Group */}
                  <div className="grid">
                    <label className="body-small text-onSurfaceVariant block mb-1">
                      Asset Group <span className="text-error">*</span>
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="outline" className="size-full justify-between">
                          {assetGroups.find(g => g.value === watch("assetGroup"))?.label || "-- Choose Asset Group --"}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-fit">
                        {assetGroups.map((group) => (
                          <DropdownMenuItem
                            key={group.value}
                            onClick={() => setValue("assetGroup", group.value)}
                          >
                            {group.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {errors.assetGroup && (
                      <span className="body-small text-error">{errors.assetGroup.message}</span>
                    )}
                  </div>

                  {/* Asset Name */}
                  <div>
                    <label className="body-small text-onSurfaceVariant block mb-1">
                      Asset Name <span className="text-error">*</span>
                    </label>
                    <Input {...register("assetName")} placeholder="e.g., Dell Laptop, HP Printer" />
                    {errors.assetName && (
                      <span className="body-small text-error">{errors.assetName.message}</span>
                    )}
                  </div>

                  {/* Quantity in Batch */}
                  <div>
                    <label className="body-small text-onSurfaceVariant block mb-1">
                      Quantity in Batch <span className="text-error">*</span>
                    </label>
                    <Input
                      type="number"
                      {...register("quantity", { valueAsNumber: true })}
                      min="1"
                      max="999"
                    />
                    {errors.quantity && (
                      <span className="body-small text-error">{errors.quantity.message}</span>
                    )}
                  </div>

                  {/* Quantity per Asset - conditional */}
                  {batchMode && (
                    <div>
                      <label className="body-small text-onSurfaceVariant block mb-1">
                        Quantity per Asset <span className="text-error">*</span>
                      </label>
                      <Input
                        type="number"
                        {...register("quantityPerUnit", { valueAsNumber: true })}
                        min="1"
                        max="999"
                      />
                      {errors.quantityPerUnit && (
                        <span className="body-small text-error">{errors.quantityPerUnit.message}</span>
                      )}
                    </div>
                  )}

                  {/* Cost */}
                  <div>
                    <label className="body-small text-onSurfaceVariant block mb-1">Cost:</label>
                    <Input {...register("cost")} placeholder="0.00" />
                    {errors.cost && (
                      <span className="body-small text-error">{errors.cost.message}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="body-small text-onSurfaceVariant block mb-1">Description</label>
                  <TextArea {...register("description")} placeholder="Tin mining industry" />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="body-small text-onSurfaceVariant block mb-1">
                      Purchase Date
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
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="body-small text-onSurfaceVariant block mb-1">
                      Date First Used / Depreciation Start Date
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
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>

              {/* Tabs */}
              <Tabs tabs={tabs} variant={"underline"} className="m-0" />
            </form>
          </div>

          {/* Right: Reserved section */}
          <div className="flex-1">
            <Card className="p-6 h-[calc(100%-var(--spacing)*2)]">
              <p className="body-medium text-onSurfaceVariant">Work in Progress</p>
            </Card>
          </div>
        </div>

        {/* Footer (Create Asset) */}
        <div className="mt-6 flex justify-end gap-6 sticky bottom-0 bg-surface p-4 border-t border-outline">
          <Button onClick={handleFakeSubmit} disabled={isSubmitting} className="bg-warning text-onWarning rounded-md hover:bg-warning/80">{isSubmitting ? "Creating..." : "Fake Submit (Test)"}</Button>
          <Button onClick={() => formRef.current?.requestSubmit()}>Create Asset</Button>
        </div>
      </div>
    </div>
  );
});

export default CreateAsset;