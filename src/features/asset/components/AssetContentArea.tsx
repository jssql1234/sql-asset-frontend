import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui/components";
import { TableColumnVisibility } from "@/components/ui/components/Table/index";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type CustomColumnDef } from "@/components/ui/utils/dataTable";
import { cn } from "@/utils/utils";
import AssetForm from "./AssetForm";
import type { Asset } from "@/types/asset";
import { useGetAsset, useCreateAsset, useUpdateAsset } from "../hooks/useAssetService";
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
const createColumns = (): CustomColumnDef<Asset>[] => [
  {
    id: "id",
    accessorKey: "id",
    header: "Asset ID",
    meta: { label: "Asset ID" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "batchId", 
    accessorKey: "batchId", 
    header: "Batch ID",
    meta: { label: "Batch ID" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Asset Name", 
    meta: { label: "Asset Name" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "group",
    accessorKey: "group",
    header: "Asset Group",
    meta: { label: "Asset Group" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    meta: { label: "Description" },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <span className="truncate block" title={value}>
          {value}
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "acquireDate",
    accessorKey: "acquireDate",
    header: "Acquire Date",
    meta: { label: "Acquire Date" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "purchaseDate", 
    accessorKey: "purchaseDate", 
    header: "Purchase Date",
    meta: { label: "Purchase Date" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "cost",
    accessorKey: "cost",
    header: "Cost",
    meta: { label: "Cost" },
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value.toLocaleString();
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "qty",
    accessorKey: "qty",
    header: "Qty",
    meta: { label: "Qty" },
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value.toLocaleString();
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  // {
  //   id: "qe",
  //   accessorKey: "qe",
  //   header: "QE", 
  //   meta: { label: "QE" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
  // {
  //   id: "re",
  //   accessorKey: "re",
  //   header: "RE",
  //   meta: { label: "RE" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
  // {
  //   id: "ia",
  //   accessorKey: "ia",
  //   header: "IA",
  //   meta: { label: "IA" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
  // {
  //   id: "aa",
  //   accessorKey: "aa",
  //   header: "AA",
  //   meta: { label: "AA" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
  // {
  //   id: "aca",
  //   accessorKey: "aca",
  //   header: "ACA",
  //   meta: { 
  //     label: "ACA",
  //     filterOptions: { "true": "Yes", "false": "No" }
  //   },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as boolean;
  //     return value ? "Yes" : "No";
  //   },
  // },
  {
    id: "active",
    accessorKey: "active",
    header: "Active",
    meta: { 
      label: "Active",
      filterOptions: { "true": "Yes", "false": "No" }
    },
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return value ? "Yes" : "No";
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  // {
  //   id: "personalUsePct",
  //   accessorKey: "personalUsePct",
  //   header: "Personal Use %",
  //   meta: { label: "Personal Use %" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
];

interface UserAssetContentAreaProps {
  selectedTaxYear?: string;
  onTaxYearChange?: (year: string) => void;
}

export default function AssetContentArea({ selectedTaxYear: externalSelectedTaxYear, onTaxYearChange }: UserAssetContentAreaProps) {
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [searchValue, setSearchValue] = useState('');
  const [groupByBatch, setGroupByBatch] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [internalSelectedTaxYear, setInternalSelectedTaxYear] = useState<string>(new Date().getFullYear().toString());
  const [isTaxView, setIsTaxView] = useState<boolean>(true);
  const [availableTaxYears, setAvailableTaxYears] = useState<SelectDropdownOption[]>([]);

  // Use external tax year if provided, otherwise use internal state
  const selectedTaxYear = externalSelectedTaxYear ?? internalSelectedTaxYear;
  const setSelectedTaxYear = (year: string) => {
    if (onTaxYearChange) {
      onTaxYearChange(year);
    } else {
      setInternalSelectedTaxYear(year);
      sessionStorage.setItem('selectedTaxYear', year);
    }
  };

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
    setView('list');
    setEditingAsset(null);
    void navigate('/asset');
  });

  const updateAssetMutation = useUpdateAsset(() => {
    setView('list');
    setEditingAsset(null);
    void navigate('/asset');
  });

  const isTaxAgent = hasPermission("processCA", "execute");
  const isAdmin = hasPermission("maintainItem", "execute") && hasPermission("processCA", "execute");

  // Determine effective user role based on admin toggle
  const effectiveUserRole = isAdmin && !isTaxView ? 'normal' : (isTaxAgent ? 'taxAgent' : 'normal');

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

  // Handle row selection and maintain asset ID mapping
  const handleRowSelectionChange = (rows: Asset[]) => {

    if (assets && rows.length > 0) {
      const assetIds = rows.map(row => row.id);
      setSelectedAssetIds(assetIds);
    } else {
      setSelectedAssetIds([]);
    }
  };

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
        (asset.id || '').toLowerCase().includes(searchLower) ||
        (asset.batchId || '').toLowerCase().includes(searchLower) ||
        (asset.name || '').toLowerCase().includes(searchLower) ||
        (asset.group || '').toLowerCase().includes(searchLower) ||
        (asset.description || '').toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [assets, searchValue, isTaxAgent, selectedTaxYear]);

  // Summary cards data
  const summaryCardsData: SummaryCardItem[] = [
    {
      label: "Total Asset Cost",
      value: `RM ${(assets?.reduce((sum, asset) => sum + (asset.cost || 0), 0) ?? 0).toLocaleString()}`,
      description: "Combined cost of all assets",
    },
    {
      label: "Total Assets",
      value: assets?.length.toString() ?? "0",
      description: "Total registered assets",
    },
    {
      label: "Active Assets",
      value: assets?.filter(asset => asset.active).length.toString() ?? "0",
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
          />

          <SummaryCards data={summaryCardsData} columns={3} />

          <div className="my-6 space-y-4">
            {(isTaxAgent) && <div className="flex items-center gap-4 min-h-[40px]">
              {((!isAdmin) || (isTaxView)) && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-onSurface">Tax Year:</label>
                  <SelectDropdown
                    className="w-40"
                    value={selectedTaxYear}
                    placeholder="Select Tax Year"
                    options={taxYearOptions}
                    onChange={setSelectedTaxYear}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Process Capital Allowance for the selected tax year
                      addToast({
                        variant: "info",
                        title: "Processing Capital Allowance",
                        description: `Starting Capital Allowance processing for YA ${selectedTaxYear}...`,
                        duration: 2000,
                      });

                      // Simulate CA processing
                      setTimeout(() => {
                        // Calculate next tax year
                        const currentYear = parseInt(selectedTaxYear);
                        const nextTaxYear = (currentYear + 1).toString();

                        // Add new tax year to available options
                        const newTaxYearOption = {
                          value: nextTaxYear,
                          label: `YA ${nextTaxYear}`
                        };

                        setAvailableTaxYears(prev => {
                          // Check if the year already exists
                          const exists = prev.some(option => option.value === nextTaxYear);
                          if (!exists) {
                            return [...prev, newTaxYearOption].sort((a, b) => parseInt(b.value) - parseInt(a.value));
                          }
                          return prev;
                        });

                        addToast({
                          variant: "success",
                          title: "Capital Allowance Processed",
                          description: `Successfully processed Capital Allowance for YA ${selectedTaxYear}. New tax year YA ${nextTaxYear} is now available.`,
                          duration: 5000,
                        });

                        // Auto-select the new tax year
                        setSelectedTaxYear(nextTaxYear);
                      }, 3000);
                    }}
                  >
                    Confirm Process Done
                  </Button>
                </div>
              )}

              {isAdmin && (
                <div className="flex items-center gap-2 self-center ml-auto">
                  <label className="text-sm font-medium text-onSurface">View:</label>
                  <div
                    className="flex bg-secondaryContainer text-onSecondaryContainer rounded overflow-hidden cursor-pointer"
                    onClick={() => {
                      setIsTaxView(!isTaxView);
                    }}
                  >
                    <div
                      className={cn(
                        "px-3 py-1 body-small transition-colors",
                        isTaxView && "bg-primary text-onPrimary"
                      )}
                    >
                      Tax View
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 body-small transition-colors",
                        !isTaxView && "bg-primary text-onPrimary"
                      )}
                    >
                      User View
                    </div>
                  </div>
                </div>
              )}
            </div>}            

            <Search
              searchValue={searchValue}
              searchPlaceholder="Search by asset ID, batch ID, asset name, asset group, description"
              onSearch={setSearchValue}
              live={true}
            />
          </div>

          <Card className="p-3">
          {/* Header actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* <div className="label-medium-bold text-onSurface">Asset Overview</div> */}
              <div className="flex bg-secondaryContainer text-onSecondaryContainer rounded overflow-hidden"
              onClick={() => {
                setGroupByBatch(!groupByBatch);
              }}>
                <button
                  type="button"
                  className={cn(
                    "px-3 py-1 body-small",
                    !groupByBatch && "bg-primary text-onPrimary"
                  )}
                >
                  Asset
                </button>
                <button
                  type="button"
                  className={cn(
                    "px-3 py-1 body-small",
                    groupByBatch && "bg-primary text-onPrimary"
                  )}
                >
                  Batch
                </button>
              </div>
              <TableColumnVisibility
                columns={allColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                className="size-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <PermissionGuard feature="maintainItem" action="entryNew">

              <Button size="sm" onClick={() => {
                setView('create');
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
                         }
                       }
                     }}
                     disabled={selectedAssetIds.length !== 1 || assetsLoading}
                   >
                     <Edit className="h-4 w-4" />Edit
                   </Button>
                   <Button variant="destructive" size="sm"><Delete className="h-4 w-4" />Delete Selected</Button>
                   <Button variant="destructive" size="sm" onClick={() => {
                     void navigate('/disposal');
                   }}>Dispose</Button>
                   <div className="body-small text-onSurfaceVariant">{selectedAssetIds.length} selected</div>
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
            selectedCount={selectedAssetIds.length}
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
          }}
          onSuccess={(data) => {
            const asset: Asset = {
              id: data.code,
              batchId: data.batchID ?? '',
              name: data.assetName,
              group: data.assetGroup,
              description: data.description ?? '',
              acquireDate: data.acquireDate || '',
              purchaseDate: data.purchaseDate ?? '',
              cost: Number(data.cost ?? '0') || 0,
              qty: data.quantity,
              active: !data.inactive,
            };
            createAssetMutation.mutate(asset);
          }}
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
          }}
          onSuccess={(data) => {
            const asset: Asset = {
              id: data.code,
              batchId: data.batchID ?? '',
              name: data.assetName,
              group: data.assetGroup,
              description: data.description ?? '',
              acquireDate: data.acquireDate || '',
              purchaseDate: data.purchaseDate ?? '',
              cost: Number(data.cost ?? '0') || 0,
              qty: data.quantity,
              active: !data.inactive,
            };
            updateAssetMutation.mutate(asset);
          }}
        />
      )}
    </>
  );
}