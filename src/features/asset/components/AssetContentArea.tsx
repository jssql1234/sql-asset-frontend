import { useEffect, useMemo, useState } from "react";
import { Button, Card, Switch } from "@/components/ui/components";
import { TableColumnVisibility } from "@/components/ui/components/Table/index";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type CustomColumnDef } from "@/components/ui/utils/dataTable";
import AssetForm from "./AssetForm";
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
const createColumns = (groupByBatch: boolean): CustomColumnDef<Asset>[] => {
  const columns: CustomColumnDef<Asset>[] = [];

  // Asset ID (excluded in batch mode)
  if (!groupByBatch) {
    columns.push({
      id: "id",
      accessorKey: "id",
      header: "Asset ID",
      meta: { label: "Asset ID" },
      enableSorting: true,
      enableColumnFilter: false,
    });
  }

  // Batch ID (grouping anchor)
  columns.push({
    id: "batchId",
    accessorKey: "batchId",
    header: "Batch ID",
    meta: { label: "Batch ID" },
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ row, getValue }) => {
      const value = getValue() || '';
      if (row.getIsGrouped()) {
        return (
          <div>
            <div className="font-medium">{value || "Ungrouped"}</div>
            <div className="text-sm text-muted-foreground">
              {row.subRows.length.toString()} asset{row.subRows.length !== 1 ? "s" : ""}
            </div>
          </div>
        );
      }
      return value || "-";
    },
  });

  // Name (aggregate first value in batch mode)
  columns.push({
    id: "name",
    accessorKey: "name",
    header: "Asset Name",
    meta: { label: "Asset Name" },
    enableSorting: true,
    enableColumnFilter: false,
    ...(groupByBatch && {
      aggregationFn: (_columnId, leafRows) => String(leafRows[0].getValue('name') ?? ''),
    }),
  });

  // Group (aggregate first value in batch mode)
  columns.push({
    id: "group",
    accessorKey: "group",
    header: "Asset Group",
    meta: { label: "Asset Group" },
    enableSorting: true,
    enableColumnFilter: false,
    ...(groupByBatch && {
      aggregationFn: (_columnId, leafRows) => String(leafRows[0].getValue('group') ?? ''),
    }),
  });

  // Description (aggregate first value in batch mode)
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
    ...(groupByBatch && {
      aggregationFn: (_columnId, leafRows) => String(leafRows[0].getValue('description') ?? ''),
    }),
  });

  // Acquire & Purchase Dates (excluded in batch mode)
  if (!groupByBatch) {
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
  }

  // Cost (sum in batch mode)
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
    ...(groupByBatch && { aggregationFn: 'sum' as const }),
  });

  // Quantity (excluded in batch mode)
  if (!groupByBatch) {
    columns.push({
      id: "qty",
      accessorKey: "qty",
      header: "Qty",
      meta: { label: "Qty" },
    cell: ({ getValue }) => {
      const value = Number(getValue() || 0);
      return Number.isFinite(value) ? value.toLocaleString() : '-';
    },
      enableSorting: true,
      enableColumnFilter: false,
    });
  }

  // Active (custom aggregate summary in batch mode)
  columns.push({
    id: "active",
    accessorKey: "active",
    header: "Active",
    meta: {
      label: "Active",
      filterOptions: { true: "Yes", false: "No" },
    },
    cell: ({ row, getValue }) => {
      if (row.getIsGrouped()) {
        const leafRows = row.getLeafRows();
        const total = leafRows.length;
        const activeCount = leafRows.filter((r) => (r.original).active).length;
        return `${activeCount.toString()}/${total.toString()} active`;
      }
      const value = Boolean(getValue());
      return value ? "Yes" : "No";
    },
    enableSorting: true,
    enableColumnFilter: false,
    ...(groupByBatch && {
      aggregationFn: (_columnId, leafRows) => {
        const total = leafRows.length;
        const activeCount = leafRows.filter((r) => (r.original).active).length;
        return `${activeCount.toString()}/${total.toString()} active`;
      },
    }),
  });

  return columns;
};

interface UserAssetContentAreaProps {
  selectedTaxYear?: string;
  onTaxYearChange?: (year: string) => void;
}

export default function AssetContentArea({ selectedTaxYear: externalSelectedTaxYear, onTaxYearChange }: UserAssetContentAreaProps) {
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [searchValue, setSearchValue] = useState('');
  const [groupByBatch, setGroupByBatch] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [internalSelectedTaxYear, setInternalSelectedTaxYear] = useState<string>(new Date().getFullYear().toString());
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

  const deleteAssetMutation = useDeleteAsset();

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
           void navigate(`/asset/edit-asset/${asset.id}`);
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
  
  // Create columns and manage visibility (dynamic by batch mode)
  const allColumns = useMemo(() => createColumns(groupByBatch), [groupByBatch]);
  const [visibleColumns, setVisibleColumns] = useState<CustomColumnDef<Asset>[]>(allColumns);

  // Use dynamic columns directly (exclusions handled in createColumns)
  const tableColumns = useMemo(() => allColumns, [allColumns]);

  // Update visible columns when switching modes
  useEffect(() => {
    setVisibleColumns(tableColumns);
  }, [tableColumns]);

  // Clear selection when switching between batch and asset modes
  useEffect(() => {
    setSelectedAssetIds([]);
    setSelectedBatchIds([]);
  }, [groupByBatch]);

  // Handle row selection and maintain asset ID mapping
  const handleRowSelectionChange = (rows: Asset[]) => {
    if (!assets || rows.length === 0) {
      setSelectedAssetIds([]);
      setSelectedBatchIds([]);
      return;
    }

    if (!groupByBatch) {
      setSelectedAssetIds(rows.map((r) => r.id));
      setSelectedBatchIds([]);
      return;
    }

    // Batch mode: track selected batch IDs and map to all assets in those batches
    const batchIds = Array.from(new Set(rows.map((r) => r.batchId || '').filter(Boolean)));
    setSelectedBatchIds(batchIds);
    
    const assetsToInclude = new Set<string>();
    const source = filteredAssets ?? assets;
    for (const r of rows) {
      const batch = r.batchId || '';
      source
        .filter((a) => (a.batchId || '') === batch)
        .forEach((a) => assetsToInclude.add(a.id));
    }
    setSelectedAssetIds(Array.from(assetsToInclude));
  };

  const handleDeleteSelected = () => {
    if (selectedAssetIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedAssetIds.length.toString()} selected asset(s)? This action cannot be undone.`)) return;
    selectedAssetIds.forEach(id => {
      deleteAssetMutation.mutate(id);
    });
    setSelectedAssetIds([]);
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
        asset.id.toLowerCase().includes(searchLower) ||
        asset.batchId.toLowerCase().includes(searchLower) ||
        asset.name.toLowerCase().includes(searchLower) ||
        asset.group.toLowerCase().includes(searchLower) ||
        asset.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [assets, searchValue, isTaxAgent, selectedTaxYear]);

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
                  )
                }
              ] : []
            }
          />

          <SummaryCards data={summaryCardsData} columns={3} />

          <div className="my-6 space-y-4">

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
              {/* Batch Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  isChecked={groupByBatch}
                  onChange={setGroupByBatch}
                />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Batch Mode
                </label>
              </div>
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
                setView('create');
                void navigate('/asset/create-asset');
              }}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
              </PermissionGuard>
               {(groupByBatch ? selectedBatchIds.length > 0 : selectedAssetIds.length > 0) && (
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
                     {groupByBatch ? `${selectedBatchIds.length.toString()} batch${selectedBatchIds.length !== 1 ? 'es' : ''} selected` : `${selectedAssetIds.length.toString()} selected`}
                   </div>
                 </div>
               )}
            </div>
          </div>

          <DataTableExtended
            key={`asset-table-${groupByBatch ? 'batch' : 'asset'}`}
            columns={visibleColumns}
            data={filteredAssets ?? []}
            showPagination={true}
            showCheckbox={true}
            enableRowClickSelection={true}
            onRowSelectionChange={handleRowSelectionChange}
            selectedCount={groupByBatch ? selectedBatchIds.length : selectedAssetIds.length}
            totalCount={groupByBatch 
              ? (filteredAssets ? new Set(filteredAssets.map(a => a.batchId)).size : 0)
              : filteredAssets?.length ?? 0}
            enableGrouping={true}
            grouping={groupByBatch ? ['batchId'] : []}
            expanded={groupByBatch ? {} : undefined}
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
      onSuccess={(data) => {
        const asset: Asset = {
          id: data.code,
          batchId: data.batchID ?? '',
          name: data.assetName,
          group: data.assetGroup,
          description: data.description ?? '',
          acquireDate: data.acquireDate,
          purchaseDate: data.purchaseDate ?? '',
          cost: Number(data.cost ?? '0'),
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
            void navigate(`/asset`);
          }}
      onSuccess={(data) => {
        const asset: Asset = {
          id: data.code,
          batchId: data.batchID ?? '',
          name: data.assetName,
          group: data.assetGroup,
          description: data.description ?? '',
          acquireDate: data.acquireDate,
          purchaseDate: data.purchaseDate ?? '',
          cost: Number(data.cost ?? '0'),
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
