 import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Card, Option } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import type { CreateAssetFormData } from "../zod/createAssetForm";
import SelectDropdown from "@/components/SelectDropdown";

interface DepreciationTabProps {
  control: Control<CreateAssetFormData>;
  watch: UseFormWatch<CreateAssetFormData>;
  setValue: UseFormSetValue<CreateAssetFormData>;
  onScheduleStateChange: (state: DepreciationScheduleViewState) => void;
}

interface DepreciationScheduleRow {
  label: string;
  depreciation: number;
  netBookValue: number;
  months: number;
}

interface DepreciationScheduleState {
  rows: DepreciationScheduleRow[];
  editableRows: DepreciationScheduleRow[];
  isEditing: boolean;
  isManual: boolean;
  isMonthly: boolean;
  ceilingApplied: boolean;
}

interface DepreciationScheduleControls {
  enterEditMode: () => void;
  cancelEditMode: () => void;
  saveEditMode: () => void;
  applyCeilingRounding: () => void;
  updateEditableRow: (index: number, depreciation: number) => void;
  addEditableRow: () => void;
  removeEditableRow: () => void;
}

export interface DepreciationScheduleViewState {
  state: DepreciationScheduleState;
  controls: DepreciationScheduleControls;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const parseCurrency = (value?: string | null): number => {
  if (!value) return 0;
  const sanitized = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number): string => currencyFormatter.format(Number.isFinite(value) ? value : 0);

const parseRate = (value?: string | null): number => {
  if (!value) return 0;
  const sanitized = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundToTwo = (value: number): number => Math.round(value * 100) / 100;

const getAcquireDateInfo = (acquireDate?: string) => {
  if (acquireDate) {
    const date = new Date(acquireDate);
    if (!Number.isNaN(date.getTime())) {
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: 1 };
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const applyCeiling = (rows: DepreciationScheduleRow[]): DepreciationScheduleRow[] => {
  if (rows.length === 0) return rows;

  let depAdjustment = 0;

  const ceiled = rows.map((row, index) => {
    if (index === rows.length - 1) {
      const depreciation = roundToTwo(row.depreciation + depAdjustment);
      return { ...row, depreciation };
    }

    const ceiledDep = Math.ceil(row.depreciation);
    depAdjustment += row.depreciation - ceiledDep;

    return { ...row, depreciation: ceiledDep };
  });

  // Recalculate net book values based on the ceiled depreciation
  let currentNBV = rows.length > 0 ? rows[0].netBookValue + rows[0].depreciation : 0;
  return ceiled.map((row) => {
    currentNBV = roundToTwo(currentNBV - row.depreciation);
    return { ...row, netBookValue: currentNBV };
  });
};

const updateEditable = (
  rows: DepreciationScheduleRow[],
  index: number,
  depreciation: number,
): DepreciationScheduleRow[] => {
  const safeRows = [...rows];
  const clampedDep = roundToTwo(clampNonNegative(depreciation));

  if (index < 0 || index >= safeRows.length) return rows;

  const previousNBV = index === 0 ? safeRows[0].netBookValue + safeRows[0].depreciation : safeRows[index - 1].netBookValue;
  safeRows[index] = {
    ...safeRows[index],
    depreciation: clampedDep,
    netBookValue: roundToTwo(clampNonNegative(previousNBV - clampedDep)),
  };

  for (let i = index + 1; i < safeRows.length; i += 1) {
    const prev = safeRows[i - 1];
    safeRows[i] = {
      ...safeRows[i],
      netBookValue: roundToTwo(clampNonNegative(prev.netBookValue - safeRows[i].depreciation)),
    };
  }

  return safeRows;
};

const addManualRow = (rows: DepreciationScheduleRow[], isMonthly: boolean): DepreciationScheduleRow[] => {
  const last = rows.length > 0 ? rows[rows.length - 1] : undefined;
  let label = "";
  if (isMonthly) {
    if (last) {
      const [yearStr, monthStr] = last.label.split(" ");
      const year = parseInt(yearStr, 10);
      const monthIndex = monthNames.findIndex((name) => name === monthStr);
      const nextTotalMonths = (year * 12) + (monthIndex >= 0 ? monthIndex : 0) + 1;
      const nextYear = Math.floor(nextTotalMonths / 12);
      const nextMonthIndex = nextTotalMonths % 12;
      label = `${String(nextYear)} ${monthNames[nextMonthIndex]}`;
    } else {
      const now = new Date();
      label = `${String(now.getFullYear())} ${monthNames[now.getMonth()]}`;
    }
  } else if (last) {
    const lastYear = parseInt(last.label, 10);
    label = Number.isFinite(lastYear) ? String(lastYear + 1) : String(new Date().getFullYear());
  } else {
    label = String(new Date().getFullYear());
  }

  return [
    ...rows,
    {
      label,
      depreciation: 0,
      netBookValue: rows.length > 0 ? rows[rows.length - 1].netBookValue : 0,
      months: isMonthly ? 1 : 12,
    },
  ];
};

const removeManualRow = (rows: DepreciationScheduleRow[]): DepreciationScheduleRow[] => {
  if (rows.length <= 1) return rows;
  return rows.slice(0, -1);
};

const calculateYearlySchedule = (
  costValue: number,
  residualValue: number,
  usefulLifeYears: number,
  acquireYear: number,
  acquireMonth: number,
): DepreciationScheduleRow[] => {
  if (usefulLifeYears <= 0 || costValue <= 0) return [];

  const totalDepreciation = costValue - residualValue;
  if (totalDepreciation < 0) return [];

  const totalMonths = usefulLifeYears * 12;
  const monthlyDepreciation = totalMonths > 0 ? totalDepreciation / totalMonths : 0;

  const schedule: DepreciationScheduleRow[] = [];
  let remainingMonths = totalMonths;
  let currentYear = acquireYear;
  let currentValue = costValue;
  let totalApplied = 0;
  let isFirstYear = true;

  while (remainingMonths > 0) {
    const monthsThisYear = isFirstYear ? Math.min(13 - acquireMonth, remainingMonths) : Math.min(12, remainingMonths);
    isFirstYear = false;

    let depreciation = roundToTwo(monthlyDepreciation * monthsThisYear);
    if (remainingMonths === monthsThisYear) {
      depreciation = roundToTwo(totalDepreciation - totalApplied);
    }

    totalApplied += depreciation;
    currentValue = roundToTwo(Math.max(currentValue - depreciation, residualValue));

    schedule.push({
      label: monthsThisYear === 12 ? String(currentYear) : `${String(currentYear)} (${String(monthsThisYear)} mths)`,
      depreciation,
      netBookValue: currentValue,
      months: monthsThisYear,
    });

    remainingMonths -= monthsThisYear;
    currentYear += 1;
  }

  return schedule;
};

const calculateMonthlySchedule = (
  costValue: number,
  residualValue: number,
  usefulLifeMonths: number,
  acquireYear: number,
  acquireMonth: number,
): DepreciationScheduleRow[] => {
  if (usefulLifeMonths <= 0 || costValue <= 0) return [];

  const totalDepreciation = costValue - residualValue;
  if (totalDepreciation < 0) return [];

  const monthlyDepreciation = usefulLifeMonths > 0 ? totalDepreciation / usefulLifeMonths : 0;

  const schedule: DepreciationScheduleRow[] = [];
  let currentValue = costValue;
  let totalApplied = 0;

  for (let i = 0; i < usefulLifeMonths; i++) {
    const totalMonthIndex = acquireMonth - 1 + i;
    const year = acquireYear + Math.floor(totalMonthIndex / 12);
    const month = (totalMonthIndex % 12) + 1;

    let depreciation = roundToTwo(monthlyDepreciation);
    if (i === usefulLifeMonths - 1) {
      depreciation = roundToTwo(totalDepreciation - totalApplied);
    }

    totalApplied += depreciation;
    currentValue = roundToTwo(Math.max(currentValue - depreciation, residualValue));

    schedule.push({
      label: `${String(year)} ${monthNames[month - 1]}`,
      depreciation,
      netBookValue: currentValue,
      months: 1,
    });
  }

  return schedule;
};

const calculateSchedule = (
  frequency: string,
  method: string,
  costValue: number,
  residualValue: number,
  usefulLifeValue: number,
  acquireDate?: string,
): DepreciationScheduleRow[] => {
  if (method === "Manual") return [];

  const { year, month } = getAcquireDateInfo(acquireDate);

  if (frequency === "Monthly") {
    return calculateMonthlySchedule(costValue, residualValue, usefulLifeValue, year, month);
  }

  return calculateYearlySchedule(costValue, residualValue, usefulLifeValue, year, month);
};

const clampNonNegative = (value: number): number => (value < 0 ? 0 : value);

interface EditableFlags {
  usefulLife: boolean;
  residualValue: boolean;
  depreciationRate: boolean;
  totalDepreciation: boolean;
}

const areSchedulesEqual = (a: DepreciationScheduleRow[], b: DepreciationScheduleRow[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const rowA = a[i];
    const rowB = b[i];
    if (
      rowA.label !== rowB.label ||
      Math.abs(rowA.depreciation - rowB.depreciation) > 0.001 ||
      Math.abs(rowA.netBookValue - rowB.netBookValue) > 0.001
    ) {
      return false;
    }
  }
  return true;
};

const computeDependentValues = (
  costValue: number,
  usefulLife: number,
  residualValue: number,
  totalDepreciation: number,
  depreciationRate: number,
  flags: EditableFlags,
  isMonthly: boolean,
): Partial<Record<"usefulLife" | "residual" | "total" | "rate", number>> => {
  const next: Partial<Record<"usefulLife" | "residual" | "total" | "rate", number>> = {};
  let life = usefulLife;
  let residual = residualValue;
  let total = totalDepreciation;
  let rate = depreciationRate;

  if (costValue <= 0) {
    if (!flags.residualValue) {
      residual = 0;
      next.residual = 0;
    }
    if (!flags.totalDepreciation) {
      total = 0;
      next.total = 0;
    }
    if (!flags.depreciationRate) {
      next.rate = 0;
    }
    if (!flags.usefulLife && isMonthly) {
      const defaultLife = 12;
      next.usefulLife = defaultLife;
    }
    return next;
  }

  if (!flags.residualValue && flags.totalDepreciation) {
    residual = clampNonNegative(costValue - total);
    next.residual = residual;
  }

  if (!flags.totalDepreciation && flags.residualValue) {
    total = clampNonNegative(costValue - residual);
    next.total = total;
  }

  if (!flags.residualValue && !flags.totalDepreciation) {
    if (flags.depreciationRate && life > 0 && rate > 0) {
      residual = clampNonNegative(costValue - costValue * (rate / 100) * life);
    } else {
      residual = clampNonNegative(costValue - total);
    }
    total = clampNonNegative(costValue - residual);
    next.residual = residual;
    next.total = total;
  }

  if (!flags.depreciationRate) {
    const safeLife = life > 0 ? life : isMonthly ? 12 : life;
    rate = ((costValue - residual) / (costValue * safeLife)) * 100;
    next.rate = Number.isFinite(rate) ? rate : 0;
  }

  if (!flags.usefulLife) {
    if (rate > 0) {
      life = (costValue - residual) / (costValue * (rate / 100));
      if (!Number.isFinite(life) || life <= 0) {
        life = isMonthly ? 12 : life;
      }
    } else if (total > 0) {
      const estimated = (costValue - residual) / (total / (life || 1));
      life = Number.isFinite(estimated) && estimated > 0 ? estimated : isMonthly ? 12 : life;
    } else {
      life = isMonthly ? 12 : life;
    }
    life = Math.max(1, Math.round(life));
    next.usefulLife = life;

    if (!flags.depreciationRate) {
      const recalculatedRate = ((costValue - residual) / (costValue * life)) * 100;
      next.rate = Number.isFinite(recalculatedRate) ? recalculatedRate : 0;
    }
  }

  if (!flags.residualValue) {
    next.residual = clampNonNegative(residual);
  }
  if (!flags.totalDepreciation) {
    const baseResidual = next.residual ?? residual;
    next.total = clampNonNegative(costValue - baseResidual);
  }

  return next;
};

export const DepreciationTab: React.FC<DepreciationTabProps> = ({
  control,
  watch,
  setValue,
  onScheduleStateChange,
}) => {
  const cost = watch("cost", "");
  const usefulLife = watch("usefulLife");
  const residualValue = watch("residualValue", "");
  const depreciationRate = watch("depreciationRate", "");
  const totalDepreciation = watch("totalDepreciation", "");
  const acquireDate = watch("acquireDate", "");

  const method = watch("depreciationMethod", "Straight Line");
  const frequency = watch("depreciationFrequency", "Yearly");
  
  const isMonthly = frequency === "Monthly";

  const previousFrequencyRef = useRef<string | null>(null);
  const skipNextUsefulLifeComputeRef = useRef(false);

  const [editableFlags, setEditableFlags] = useState<EditableFlags>({
    usefulLife: false,
    residualValue: false,
    depreciationRate: false,
    totalDepreciation: false,
  });

  const [scheduleRows, setScheduleRows] = useState<DepreciationScheduleRow[]>([]);
  const [manualSchedule, setManualSchedule] = useState<DepreciationScheduleRow[]>([]);
  const [editableRows, setEditableRows] = useState<DepreciationScheduleRow[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [ceilingApplied, setCeilingApplied] = useState(false);

  const costValue = useMemo(() => parseCurrency(cost), [cost]);
  const residualValueNumber = useMemo(() => parseCurrency(residualValue), [residualValue]);
  const totalDepreciationNumber = useMemo(() => parseCurrency(totalDepreciation), [totalDepreciation]);
  const depreciationRateNumber = useMemo(() => parseRate(depreciationRate), [depreciationRate]);

   useEffect(() => {
     if (previousFrequencyRef.current !== frequency) {
       const switchedToMonthly = frequency === "Monthly";
       skipNextUsefulLifeComputeRef.current = switchedToMonthly;

       // Recalculate manual schedule when frequency changes in Manual mode
       if (method === "Manual" && manualSchedule.length > 0 && previousFrequencyRef.current !== null) {
         const confirmed = window.confirm("This will clear your custom schedule. Continue?");
          if (confirmed) {
            const newSchedule = calculateSchedule(
              frequency,
              "Straight Line",
              costValue,
              residualValueNumber,
              usefulLife,
              acquireDate,
            );
            setManualSchedule(newSchedule);
            previousFrequencyRef.current = frequency;
          } else {
            // Revert frequency to previous value if canceled
            setValue("depreciationFrequency", previousFrequencyRef.current, { shouldDirty: false });
          }
       } else {
         // Set useful life only if not in Manual mode with schedule or if confirmed
         if (switchedToMonthly && !editableFlags.usefulLife) {
           const defaultLife = 12;
           setValue("usefulLife", defaultLife, { shouldDirty: false });
         }
       }
     }
   }, [editableFlags.usefulLife, frequency, setValue, method, manualSchedule.length, costValue, residualValueNumber, usefulLife, acquireDate]);

  useEffect(() => {
    if (method === "Manual") {
      setEditableFlags({
        usefulLife: false,
        residualValue: false,
        depreciationRate: false,
        totalDepreciation: false,
      });
    }
  }, [method]);

  useEffect(() => {
    if (method === "Manual") {
      return;
    }

    const computed = computeDependentValues(
      costValue,
      usefulLife,
      residualValueNumber,
      totalDepreciationNumber,
      depreciationRateNumber,
      editableFlags,
      isMonthly,
    );

    if (computed.residual !== undefined && !editableFlags.residualValue) {
      const formattedResidual = formatCurrency(computed.residual);
      if (formattedResidual !== residualValue) {
        setValue("residualValue", formattedResidual, { shouldDirty: false });
      }
    }

    if (computed.total !== undefined && !editableFlags.totalDepreciation) {
      const formattedTotal = formatCurrency(computed.total);
      if (formattedTotal !== totalDepreciation) {
        setValue("totalDepreciation", formattedTotal, { shouldDirty: false });
      }
    }

    if (computed.rate !== undefined && !editableFlags.depreciationRate) {
      const formattedRate = Number.isFinite(computed.rate) ? String(Math.round(computed.rate)) : "0";
      if (formattedRate !== depreciationRate) {
        setValue("depreciationRate", formattedRate, { shouldDirty: false });
      }
    }

    if (computed.usefulLife !== undefined && !editableFlags.usefulLife) {
      if (isMonthly && skipNextUsefulLifeComputeRef.current) {
        skipNextUsefulLifeComputeRef.current = false;
      } else {
        const rounded = Math.max(1, Math.round(computed.usefulLife));
        if (rounded !== usefulLife) {
          setValue("usefulLife", rounded, { shouldDirty: false });
        }
      }
    }
  }, [
    method,
    costValue,
    depreciationRate,
    depreciationRateNumber,
    editableFlags,
    isMonthly,
    residualValue,
    residualValueNumber,
    setValue,
    totalDepreciation,
    totalDepreciationNumber,
    usefulLife,
  ]);

  useEffect(() => {
    if (method === "Manual") {
      return;
    }

    const schedule = calculateSchedule(
      frequency,
      method,
      costValue,
      residualValueNumber,
      usefulLife,
      acquireDate,
    );

    setScheduleRows((prevScheduleRows) => {
      if (!areSchedulesEqual(prevScheduleRows, schedule)) {
        setCeilingApplied(false);
        return schedule;
      }
      return prevScheduleRows;
    });

    if (!isEditing && manualSchedule.length > 0) {
      setManualSchedule([]);
    }
  }, [
    acquireDate,
    costValue,
    manualSchedule.length,
    method,
    frequency,
    residualValueNumber,
    usefulLife,
    isEditing,
  ]);

  const hasManualSchedule = manualSchedule.length > 0;

  useEffect(() => {
    if (method === "Manual" && !hasManualSchedule) {
      const base = scheduleRows.length > 0
        ? scheduleRows
        : calculateSchedule(
            frequency,
            "Straight Line",
            costValue,
            residualValueNumber,
            usefulLife,
            acquireDate,
          );
      setManualSchedule(base);
    }

    if (method !== "Manual" && !isEditing && hasManualSchedule) {
      setManualSchedule([]);
    }
  }, [
    acquireDate,
    costValue,
    hasManualSchedule,
    isEditing,
    method,
    frequency,
    residualValueNumber,
    scheduleRows,
    usefulLife,
  ]);

  useEffect(() => {
    if (method !== "Manual") {
      return;
    }

    const lastRow = manualSchedule.length > 0
      ? manualSchedule[manualSchedule.length - 1]
      : undefined;
    if (!lastRow) {
      return;
    }

    if (!editableFlags.residualValue) {
      const formattedResidual = formatCurrency(lastRow.netBookValue);
      if (formattedResidual !== residualValue) {
        setValue("residualValue", formattedResidual, { shouldDirty: false });
      }
    }

    if (!editableFlags.totalDepreciation) {
      const total = clampNonNegative(costValue - lastRow.netBookValue);
      const formattedTotal = formatCurrency(total);
      if (formattedTotal !== totalDepreciation) {
        setValue("totalDepreciation", formattedTotal, { shouldDirty: false });
      }
    }

    if (!editableFlags.depreciationRate && depreciationRate !== "N/A") {
      setValue("depreciationRate", "N/A", { shouldDirty: false });
    }
  }, [
    costValue,
    depreciationRate,
    editableFlags,
    manualSchedule,
    method,
    residualValue,
    setValue,
    totalDepreciation,
  ]);

  const toggleEditable = useCallback((key: keyof EditableFlags) => {
    const willBeChecked = !editableFlags[key];
    
    if (method === "Manual" && willBeChecked) {
      const confirmed = window.confirm(
        "This will change depreciation method. Changing the depreciation method will clear your custom schedule. Continue?"
      );
      
      if (confirmed) {
        setValue("depreciationMethod", "Straight Line", { shouldDirty: true });
        setManualSchedule([]);
        setEditableFlags((prev) => ({ ...prev, [key]: true }));
      }
    } else {
      setEditableFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  }, [editableFlags, method, setValue]);

  const handleEnterEditMode = useCallback(() => {
    const base = method === "Manual" ? manualSchedule : scheduleRows;
    setEditableRows(base);
    setIsEditing(true);
  }, [manualSchedule, method, scheduleRows]);

  const handleCancelEditMode = useCallback(() => {
    const base = method === "Manual" ? manualSchedule : scheduleRows;
    setEditableRows(base);
    setIsEditing(false);
    setCeilingApplied(false);
  }, [manualSchedule, method, scheduleRows]);

  const handleSaveEditMode = useCallback(() => {
    if (editableRows.length === 0) {
      setIsEditing(false);
      return;
    }

    setManualSchedule(editableRows);
    if (method !== "Manual") {
      setValue("depreciationMethod", "Manual", { shouldDirty: true });
    }

    const lastRow = editableRows.length > 0 ? editableRows[editableRows.length - 1] : undefined;
    if (lastRow) {
      if (!editableFlags.residualValue) {
        setValue("residualValue", formatCurrency(lastRow.netBookValue), { shouldDirty: false });
      }
      if (!editableFlags.totalDepreciation) {
        const total = clampNonNegative(costValue - lastRow.netBookValue);
        setValue("totalDepreciation", formatCurrency(total), { shouldDirty: false });
      }
      if (!editableFlags.depreciationRate) {
        setValue("depreciationRate", "N/A", { shouldDirty: false });
      }
    }

    setIsEditing(false);
    setCeilingApplied(false);
  }, [
    costValue,
    editableFlags,
    editableRows,
    method,
    setValue,
  ]);

  const handleUpdateEditableRow = useCallback((index: number, depreciationAmount: number) => {
    setEditableRows((prev) => updateEditable(prev, index, depreciationAmount));
  }, []);

  const handleAddEditableRow = useCallback(() => {
    setEditableRows((prev) => {
      if (prev.length === 0) {
        const base = method === "Manual" ? manualSchedule : scheduleRows;
        return addManualRow(base, isMonthly);
      }
      return addManualRow(prev, isMonthly);
    });
  }, [isMonthly, manualSchedule, method, scheduleRows]);

  const handleRemoveEditableRow = useCallback(() => {
    setEditableRows((prev) => removeManualRow(prev));
  }, []);

  const handleCeilingRounding = useCallback(() => {
    if (isEditing) {
      setEditableRows((prev) => applyCeiling(prev));
      setCeilingApplied(true);
      return;
    }

    const target = method === "Manual" ? manualSchedule : scheduleRows;
    if (target.length === 0) return;
    const ceiled = applyCeiling(target);
    setManualSchedule(ceiled);
    setValue("depreciationMethod", "Manual", { shouldDirty: true });
    setCeilingApplied(true);
  }, [isEditing, manualSchedule, method, scheduleRows, setValue]);

  const scheduleControls = useMemo<DepreciationScheduleControls>(() => ({
    enterEditMode: handleEnterEditMode,
    cancelEditMode: handleCancelEditMode,
    saveEditMode: handleSaveEditMode,
    applyCeilingRounding: handleCeilingRounding,
    updateEditableRow: handleUpdateEditableRow,
    addEditableRow: handleAddEditableRow,
    removeEditableRow: handleRemoveEditableRow,
  }), [
    handleAddEditableRow,
    handleCancelEditMode,
    handleEnterEditMode,
    handleCeilingRounding,
    handleRemoveEditableRow,
    handleSaveEditMode,
    handleUpdateEditableRow,
  ]);

  useEffect(() => {
    const rows = isEditing
      ? editableRows
      : method === "Manual"
        ? manualSchedule
        : scheduleRows;

    onScheduleStateChange({
      state: {
        rows,
        editableRows,
        isEditing,
        isManual: method === "Manual",
        isMonthly,
        ceilingApplied,
      },
      controls: scheduleControls,
    });
  }, [
    editableRows,
    ceilingApplied,
    isEditing,
    isMonthly,
    manualSchedule,
    method,
    onScheduleStateChange,
    scheduleControls,
    scheduleRows,
  ]);

  const usefulLifeLabel = isMonthly ? "Useful Life (Months)" : "Useful Life (Years)";
  const rateUnit = isMonthly ? "% per month" : "% per year";

  return (
    <Card className="p-6 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-onSurface">Depreciation Method</label>
          <SelectDropdown
            className="w-full"
            value={method}
            placeholder="Select method"
            options={[
              { value: "Straight Line", label: "Straight Line" },
              { value: "Manual", label: "Manual" },
            ]}
            onChange={(nextValue) => {
              setValue("depreciationMethod", nextValue);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-onSurface">Frequency</label>
          <SelectDropdown
            className="w-full"
            value={frequency}
            placeholder="Select frequency"
            options={[
              { value: "Yearly", label: "Yearly" },
              { value: "Monthly", label: "Monthly" },
            ]}
            onChange={(nextValue) => {
              setValue("depreciationFrequency", nextValue);
            }}
            matchTriggerWidth={false}
            contentClassName="w-fit"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-onSurface">{usefulLifeLabel}</label>
            <div className="flex items-center gap-2">
              <Option
                type="checkbox"
                checked={editableFlags.usefulLife}
                onChange={() => { toggleEditable("usefulLife"); }}
              />
            </div>
          </div>
           <Controller
             name="usefulLife"
             control={control}
             render={({ field }) => (
               <Input
                 {...field}
                 type="number"
                 min={1}
                 disabled={!editableFlags.usefulLife}
               />
             )}
           />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-onSurface">Residual Value</label>
            <div className="flex items-center gap-2">
              <Option
                type="checkbox"
                checked={editableFlags.residualValue}
                onChange={() => { toggleEditable("residualValue"); }}
              />
            </div>
          </div>
           <Controller
             name="residualValue"
             control={control}
             render={({ field }) => (
               <Input
                 {...field}
                 inputMode="decimal"
                 disabled={!editableFlags.residualValue}
                 value={field.value ?? ""}
                 onBlur={(event) => {
                   const numeric = parseCurrency(event.target.value);
                   field.onChange(formatCurrency(numeric));
                 }}
               />
             )}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-onSurface">Depreciation Rate</label>
            <div className="flex items-center gap-2">
              <Option
                type="checkbox"
                checked={editableFlags.depreciationRate}
                onChange={() => { toggleEditable("depreciationRate"); }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Controller
               name="depreciationRate"
               control={control}
               render={({ field }) => (
                 <Input
                   {...field}
                   inputMode="decimal"
                   disabled={!editableFlags.depreciationRate}
                   value={field.value ?? ""}
                 />
               )}
             />
            <span className="body-small text-onSurfaceVariant whitespace-nowrap">{rateUnit}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-onSurface">Total Depreciation</label>
            <div className="flex items-center gap-2">
              <Option
                type="checkbox"
                checked={editableFlags.totalDepreciation}
                onChange={() => { toggleEditable("totalDepreciation"); }}
              />
            </div>
          </div>
           <Controller
             name="totalDepreciation"
             control={control}
             render={({ field }) => (
               <Input
                 {...field}
                 inputMode="decimal"
                 disabled={!editableFlags.totalDepreciation}
                 value={field.value ?? ""}
                 onBlur={(event) => {
                   const numeric = parseCurrency(event.target.value);
                   field.onChange(formatCurrency(numeric));
                 }}
               />
             )}
           />
        </div>
      </div>
    </Card>
  );
};

export type { DepreciationScheduleRow };
