import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card } from "@/components/ui/components";
import { TableColumnVisibility } from "@/components/ui/components/Table/index";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type CustomColumnDef } from "@/components/ui/utils/dataTable";
import AssetForm from "./AssetForm";
import type { CreateAssetFormData } from "../zod/createAssetForm";
import type { Asset } from "@/types/asset";
import { useGetAsset, useCreateAsset, useUpdateAsset, useDeleteAsset } from "../hooks/useAssetService";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import { TabHeader } from "@/components/TabHeader";
import Search from "@/components/Search";
import PermissionGuard from "@/components/PermissionGuard";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Delete, Edit, Plus } from "@/assets/icons";
import { usePermissions } from "@/hooks/usePermissions";
import SelectDropdown, { type SelectDropdownOption } from "@/components/SelectDropdown";
import { useToast } from "@/components/ui/components/Toast/useToast";

// Column definitions for TanStack Table
const createColumns = (): CustomColumnDef<Asset>[] => {
  const columns: CustomColumnDef<Asset>[] = [];

  columns.push({
    id: "id",
    accessorKey: "id",
    header: "Asset ID",
    meta: { label: "Asset ID" },
    enableSorting: true,
    enableColumnFilter: false,
  });

  columns.push({
    id: "name",
    accessorKey: "name",
    header: "Asset Name",
    meta: { label: "Asset Name" },
    enableSorting: true,
    enableColumnFilter: false,
  });

  columns.push({
    id: "group",
    accessorKey: "group",
    header: "Asset Group",
    meta: { label: "Asset Group" },
    enableSorting: true,
    enableColumnFilter: false,
  });

  columns.push({
    id: "description",
    accessorKey: "description",
    header: "Description",
    meta: { label: "Description" },
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className="truncate block" title={typeof value === 'string' ? value : ''}>
          {value}
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: false,
  });

  columns.push({
    id: "acquireDate",
    accessorKey: "acquireDate",
    header: "Acquire Date",
    meta: { label: "Acquire Date" },
    enableSorting: true,
    enableColumnFilter: false,
  });

  columns.push({
    id: "purchaseDate",
    accessorKey: "purchaseDate",
    header: "Purchase Date",
    meta: { label: "Purchase Date" },
    enableSorting: true,
    enableColumnFilter: false,
  });

  columns.push({
    id: "cost",
    accessorKey: "cost",
    header: "Cost",
    meta: { label: "Cost" },
    cell: ({ getValue }) => {
      const value = Number(getValue() || 0);
      return Number.isFinite(value) ? value.toLocaleString() : '-';
    },
    enableSorting: true,
    enableColumnFilter: false,
  });

  columns.push({
    id: "quantityPerUnit",
    accessorKey: "quantityPerUnit",
    header: "Qty",
    meta: { label: "Qty" },
    cell: ({ getValue }) => {
      const value = Number(getValue() || 0);
      return Number.isFinite(value) ? value.toLocaleString() : '-';
    },
    enableSorting: true,
    enableColumnFilter: false,
  });

  columns.push({
    id: "active",
    accessorKey: "active",
    header: "Active",
    meta: {
      label: "Active",
      filterOptions: { true: "Yes", false: "No" },
    },
    cell: ({ getValue }) => {
      const value = Boolean(getValue());
      return value ? "Yes" : "No";
    },
    enableSorting: true,
    enableColumnFilter: false,
  });

  return columns;
};

const areRowSelectionsEqual = (
  a: Record<string, boolean>,
  b: Record<string, boolean>,
): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

const haveSameMembers = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  if (a === b) {
    return true;
  }
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
};

const buildRowSelectionMap = (ids: string[]): Record<string, boolean> =>
  ids.reduce<Record<string, boolean>>((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

const mapFormDataToAsset = (data: CreateAssetFormData): Asset => ({
  id: data.code,
  name: data.assetName,
  group: data.assetGroup,
  description: data.description ?? "",
  acquireDate: data.acquireDate,
  purchaseDate: data.purchaseDate ?? "",
  cost: Number(data.cost ?? "0"),
  qty: data.quantity,
  quantityPerUnit: data.quantityPerUnit,
  active: !data.inactive,
  inactiveStart: data.inactiveStart,
  inactiveEnd: data.inactiveEnd,

  // Allowance Tab
  caAssetGroup: data.caAssetGroup,
  allowanceClass: data.allowanceClass,
  subClass: data.subClass,
  iaRate: data.iaRate,
  aaRate: data.aaRate,
  aca: data.aca,
  extraCheckbox: data.extraCheckbox,
  extraCommercial: data.extraCommercial,
  extraNewVehicle: data.extraNewVehicle,
  manualQE: data.manualQE,
  qeValue: data.qeValue,
  residualExpenditure: data.residualExpenditure,
  selfUsePercentage: data.selfUsePercentage,
  rentedApportionPercentage: data.rentedApportionPercentage,
  
  // Hire Purchase Tab
  hpStartDate: data.hpStartDate,
  hpInstalment: data.hpInstalment,
  hpDeposit: data.hpDeposit,
  hpInterest: data.hpInterest,
  hpFinance: data.hpFinance,


  //Depreciation Tab
  depreciationMethod: data.depreciationMethod,
  depreciationFrequency: data.depreciationFrequency,
  usefulLife: data.usefulLife,
  residualValue: data.residualValue,
  depreciationRate: data.depreciationRate,
  totalDepreciation: data.totalDepreciation,

  // Serial Number Tab
  serialNumbers: data.serialNumbers,

  // Allocation Tab
  branch: data.branch,
  department: data.department,
  location: data.location,
  personInCharge: data.personInCharge,
  allocationNotes: data.allocationNotes,
 
  // Warranty Tab
  warrantyProvider: data.warrantyProvider,
  warrantyStartDate: data.warrantyStartDate,
  warrantyEndDate: data.warrantyEndDate,
  warrantyNotes: data.warrantyNotes,
});

interface UserAssetContentAreaProps {
  selectedTaxYear?: string;
  onTaxYearChange?: (year: string) => void;
}

export default function AssetContentArea({ selectedTaxYear: externalSelectedTaxYear, onTaxYearChange }: UserAssetContentAreaProps) {
  const isMountedRef = useRef(false);
  const processingTimeoutRef = useRef<number | null>(null);
  const pendingSelectionRef = useRef<{ rows: Asset[]; selectedRowIds: string[] } | null>(null);
  const selectionFrameRef = useRef<number | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [searchValue, setSearchValue] = useState('');

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [internalSelectedTaxYear, setInternalSelectedTaxYear] = useState<string>(new Date().getFullYear().toString());
  const [availableTaxYears, setAvailableTaxYears] = useState<SelectDropdownOption[]>([]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      if (selectionFrameRef.current !== null) {
        window.cancelAnimationFrame(selectionFrameRef.current);
        selectionFrameRef.current = null;
      }
      pendingSelectionRef.current = null;
    };
  }, []);

  // Use external tax year if provided, otherwise use internal state
  const selectedTaxYear: string = externalSelectedTaxYear ?? internalSelectedTaxYear;
  const handleSelectTaxYear = useCallback((year: string) => {
    if (!isMountedRef.current) {
      return;
    }
    if (onTaxYearChange) {
      onTaxYearChange(year);
    } else {
      setInternalSelectedTaxYear(year);
      sessionStorage.setItem('selectedTaxYear', year);
    }
  }, [onTaxYearChange]);

  // Initialize from sessionStorage if using internal state
  useEffect(() => {
    if (!externalSelectedTaxYear) {
      const savedTaxYear = sessionStorage.getItem('selectedTaxYear');
      if (savedTaxYear) {
        setInternalSelectedTaxYear(savedTaxYear);
      }
    }
  }, [externalSelectedTaxYear]);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { hasPermission } = usePermissions();
  const { addToast } = useToast();
  const { data: assets, isLoading: assetsLoading } = useGetAsset();
  const createAssetMutation = useCreateAsset(() => {
    if (!isMountedRef.current) {
      return;
    }
    setView('list');
    setEditingAsset(null);
    void navigate('/asset');
  });

  const updateAssetMutation = useUpdateAsset(() => {
    if (!isMountedRef.current) {
      return;
    }
    setView('list');
    setEditingAsset(null);
    void navigate('/asset');
  });

  const deleteAssetMutation = useDeleteAsset();

  const handleCreateSuccess = useCallback((data: CreateAssetFormData) => {
    createAssetMutation.mutate(mapFormDataToAsset(data));
  }, [createAssetMutation]);

  const handleUpdateSuccess = useCallback((data: CreateAssetFormData) => {
    updateAssetMutation.mutate(mapFormDataToAsset(data));
  }, [updateAssetMutation]);
  
  const isTaxAgent = hasPermission("processCA", "execute");
  const isAdmin = hasPermission("maintainItem", "execute") && hasPermission("processCA", "execute");

  // Determine effective user role - admin always has admin role
  const effectiveUserRole = isAdmin ? 'admin' : (isTaxAgent ? 'taxAgent' : 'normal');

  // Initialize available tax years if empty
  useEffect(() => {
    if (availableTaxYears.length === 0) {
      const currentYear = new Date().getFullYear();
      const initialYears: SelectDropdownOption[] = [];
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        initialYears.push({ value: year.toString(), label: `YA ${String(year)}` });
      }
      setAvailableTaxYears(initialYears);
    }
  }, [availableTaxYears.length]);

  // Generate tax year options based on available asset acquire dates or stored list
  const taxYearOptions: SelectDropdownOption[] = useMemo(() => {
    if (availableTaxYears.length > 0) {
      return availableTaxYears;
    }

    // Fallback to past 5 years if no stored options
    const currentYear = new Date().getFullYear();
    const years: SelectDropdownOption[] = [];
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      years.push({ value: year.toString(), label: `YA ${String(year)}` });
    }
    return years;
  }, [availableTaxYears]);

   // Sync view state with URL
   useEffect(() => {
     if (location.pathname === '/asset/create-asset') {
       setView('create');
       setEditingAsset(null);
     } else if (location.pathname.startsWith('/asset/edit-asset/')) {
       const assetId = params.id;
       if (assetId && assets) {
         const asset = assets.find(a => a.id === assetId);
         if (asset) {
           setEditingAsset(asset);
           setView('edit');

         } else {
           // Asset not found, redirect to list
           void navigate('/asset');
         }
       }
     } else if (location.pathname === '/asset') {
       setView('list');
       setEditingAsset(null);
     }
   }, [location.pathname, params.id, assets, navigate]);
  
  // Create columns and manage visibility
  const allColumns = useMemo(() => createColumns(), []);
  const [visibleColumns, setVisibleColumns] = useState<CustomColumnDef<Asset>[]>(allColumns);

  // Use dynamic columns directly (exclusions handled in createColumns)
  const tableColumns = useMemo(() => allColumns, [allColumns]);

  // Update visible columns when switching modes
  useEffect(() => {
    setVisibleColumns(tableColumns);
  }, [tableColumns]);

  const resetSelectionState = useCallback(() => {
    setSelectedAssetIds([]);
    setRowSelection({});
  }, []);

  // Filter assets based on search value and tax year (for tax agents)
  const filteredAssets = useMemo(() => {
    if (!assets) return assets;

    let filtered = assets;

    // Apply tax year filter for tax agents
    if (isTaxAgent && selectedTaxYear) {
      const taxYearNum = parseInt(selectedTaxYear);
      filtered = filtered.filter(asset => {
        if (!asset.acquireDate) return false;
        const acquireYear = new Date(asset.acquireDate).getFullYear();
        return acquireYear <= taxYearNum;
      });
    }

    // Apply search filter
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase().trim();
      filtered = filtered.filter(asset =>
        asset.id.toLowerCase().includes(searchLower) ||
        asset.name.toLowerCase().includes(searchLower) ||
        asset.group.toLowerCase().includes(searchLower) ||
        asset.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [assets, searchValue, isTaxAgent, selectedTaxYear]);

  const flushSelection = useCallback(() => {
    if (!pendingSelectionRef.current) {
      return;
    }

    if (!isMountedRef.current) {
      pendingSelectionRef.current = null;
      return;
    }

    const { rows, selectedRowIds } = pendingSelectionRef.current;
    pendingSelectionRef.current = null;

    if (!assets || rows.length === 0) {
      resetSelectionState();
      return;
    }

    const nextRowSelection = buildRowSelectionMap(selectedRowIds);
    if (!areRowSelectionsEqual(rowSelection, nextRowSelection)) {
      setRowSelection(nextRowSelection);
    }

    const nextAssetIds = rows.map((r) => r.id);
    if (!haveSameMembers(selectedAssetIds, nextAssetIds)) {
      setSelectedAssetIds(nextAssetIds);
    }
  }, [assets, filteredAssets, resetSelectionState, rowSelection, selectedAssetIds]);

  const scheduleSelectionFlush = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }
    if (selectionFrameRef.current !== null) {
      window.cancelAnimationFrame(selectionFrameRef.current);
    }
    selectionFrameRef.current = window.requestAnimationFrame(() => {
      selectionFrameRef.current = null;
      flushSelection();
    });
  }, [flushSelection]);

  useEffect(() => {
    if (!isMountedRef.current) {
      return;
    }
    if (pendingSelectionRef.current) {
      scheduleSelectionFlush();
    }
  }, [assets, filteredAssets, scheduleSelectionFlush]);

  // Handle row selection and maintain asset ID mapping
  const handleRowSelectionChange = useCallback((rows: Asset[], selectedRowIds: string[]) => {
    pendingSelectionRef.current = { rows, selectedRowIds };
    scheduleSelectionFlush();
  }, [scheduleSelectionFlush]);

  const handleProcessCapitalAllowance = useCallback(() => {
    const currentSelection = selectedTaxYear;

    addToast({
      variant: "info",
      title: "Processing Capital Allowance",
      description: `Starting Capital Allowance processing for YA ${currentSelection}...`,
      duration: 2000,
    });

    if (processingTimeoutRef.current) {
      window.clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    processingTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) {
        processingTimeoutRef.current = null;
        return;
      }

      const parsedCurrentYear = parseInt(currentSelection, 10);
      const safeCurrentYear = Number.isNaN(parsedCurrentYear) ? new Date().getFullYear() : parsedCurrentYear;
      const nextTaxYear = (safeCurrentYear + 1).toString();

      const newTaxYearOption = {
        value: nextTaxYear,
        label: `YA ${nextTaxYear}`,
      };

      setAvailableTaxYears(prev => {
        const exists = prev.some(option => option.value === nextTaxYear);
        if (!exists) {
          return [...prev, newTaxYearOption].sort((a, b) => parseInt(b.value, 10) - parseInt(a.value, 10));
        }
        return prev;
      });

      addToast({
        variant: "success",
        title: "Capital Allowance Processed",
        description: `Successfully processed Capital Allowance for YA ${currentSelection}. New tax year YA ${nextTaxYear} is now available.`,
        duration: 5000,
      });

      handleSelectTaxYear(nextTaxYear);
      processingTimeoutRef.current = null;
    }, 3000);
  }, [addToast, handleSelectTaxYear, selectedTaxYear]);

  const handleDeleteSelected = () => {
    if (selectedAssetIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedAssetIds.length.toString()} selected asset(s)? This action cannot be undone.`)) return;
    selectedAssetIds.forEach(id => {
      deleteAssetMutation.mutate(id);
    });
    setSelectedAssetIds([]);
  };

  const totalAssetCost = useMemo(() => {
    if (!assets) {
      return 0;
    }

    return assets.reduce((sum, asset) => sum + asset.cost, 0);
  }, [assets]);

  const totalAssets = assets?.length ?? 0;

  const activeAssetCount = useMemo(() => {
    if (!assets) {
      return 0;
    }

    return assets.filter(asset => asset.active).length;
  }, [assets]);

  // Summary cards data
  const summaryCardsData: SummaryCardItem[] = [
    {
      label: "Total Asset Cost",
      value: `RM ${totalAssetCost.toLocaleString()}`,
      description: "Combined cost of all assets",
    },
    {
      label: "Total Assets",
      value: String(totalAssets),
      description: "Total registered assets",
    },
    {
      label: "Active Assets",
      value: String(activeAssetCount),
      description: "Currently active assets",
    },
    {
      label: "Initial Allowance",
      value: "RM 21.5K",
      description: "Current year",
    },
    {
      label: "Annual Allowance",
      value: "RM 64.5K",
      description: "Current year",
    },
    {
      label: "Total Depreciation",
      value: "RM 21.4K",
      description: "Current year",
    },
  ];

  return (
    <>
      {view === 'list' ? (
        <div>
          <TabHeader
            title="Asset Management"
            subtitle="Manage and track all company assets"
            actions={[]}
            inlineElements={
              isTaxAgent ? [
                {
                  key: "tax-year-selector",
                  element: (
                    <div className="flex items-center gap-2 ml-5">
                      <label className="text-sm font-medium text-onSurface">Tax Year:</label>
                      <SelectDropdown
                        className="w-40"
                        value={selectedTaxYear}
                        placeholder="Select Tax Year"
                        options={taxYearOptions}
                        onChange={handleSelectTaxYear}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleProcessCapitalAllowance}
                      >
                        Process CA
                      </Button>
                    </div>
                  )
                }
              ] : []
            }
          />

          <SummaryCards data={summaryCardsData} columns={3} />

          <div className="my-6 space-y-4">

            <Search
              searchValue={searchValue}
              searchPlaceholder="Search by asset ID, asset name, asset group, description"
              onSearch={setSearchValue}
              live={true}
            />
          </div>

          <Card className="p-3">
          {/* Header actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <TableColumnVisibility
                columns={tableColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                className="size-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <PermissionGuard feature="maintainItem" action="entryNew">

              <Button size="sm" onClick={() => {
                void navigate('/asset/create-asset');
              }}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
              </PermissionGuard>
               {selectedAssetIds.length > 0 && (
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       if (assetsLoading) {
                         return;
                       }

                       if (selectedAssetIds.length === 1 && assets && assets.length > 0) {
                         const asset = assets.find(a => a.id === selectedAssetIds[0]);

                         if (asset) {
                           setEditingAsset(asset);
                           setView('edit');
                           void navigate(`/asset/edit-asset/${asset.id}`);
                         }
                       }
                     }}
                     disabled={selectedAssetIds.length !== 1 || assetsLoading}
                   >
                     <Edit className="h-4 w-4" />Edit
                   </Button>
                   <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                     <Delete className="h-4 w-4" />Delete Selected
                   </Button>
                   <Button variant="destructive" size="sm" onClick={() => {
                     void navigate('/disposal');
                   }}>Dispose</Button>
                   <div className="body-small text-onSurfaceVariant">
                     {`${selectedAssetIds.length.toString()} selected`}
                   </div>
                 </div>
               )}
            </div>
          </div>

          <DataTableExtended
            columns={visibleColumns}
            data={filteredAssets ?? []}
            showPagination={true}
            showCheckbox={true}
            enableRowClickSelection={true}
            onRowSelectionChange={handleRowSelectionChange}
            rowSelection={rowSelection}
            selectedCount={selectedAssetIds.length}
            totalCount={filteredAssets?.length ?? 0}
          />
        </Card>
        </div>
      ) : view === 'create' ? (
        <AssetForm
          editingAsset={null}
          selectedTaxYear={selectedTaxYear}
          taxYearOptions={taxYearOptions}
          userRole={effectiveUserRole}
          onBack={() => {
            setView('list');
            setEditingAsset(null);
            void navigate(`/asset`);
          }}
          onSuccess={handleCreateSuccess}
        />
      ) : (
        <AssetForm
          editingAsset={editingAsset}
          selectedTaxYear={selectedTaxYear}
          taxYearOptions={taxYearOptions}
          userRole={effectiveUserRole}
          onBack={() => {
            setView('list');
            setEditingAsset(null);
            void navigate(`/asset`);
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}
