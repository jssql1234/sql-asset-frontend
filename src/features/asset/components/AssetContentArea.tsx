import { useMemo, useState } from "react";
import { Button, Card, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/components";
import { cn } from "@/utils/utils";

type AssetRow = {
  id: string;
  batchId: string;
  name: string;
  group: string;
  description: string;
  acquireDate: string;
  purchaseDate: string;
  cost: number;
  qty: number;
  qe: number;
  re: number;
  ia: number;
  aa: number;
  aca: boolean;
  active: boolean;
  personalUsePct: number;
};

const SAMPLE_ASSETS: AssetRow[] = [
  {
    id: "AST-0001",
    batchId: "B-2024-01",
    name: "Initial Allowance",
    group: "Plant & Machinery",
    description: "Current year",
    acquireDate: "2021-01-15",
    purchaseDate: "2021-01-01",
    cost: 21500,
    qty: 1,
    qe: 21500,
    re: 5000,
    ia: 20,
    aa: 10,
    aca: true,
    active: true,
    personalUsePct: 0,
  },
  {
    id: "AST-0002",
    batchId: "B-2024-02",
    name: "Annual Allowance",
    group: "Industrial Building",
    description: "Current year",
    acquireDate: "2021-05-20",
    purchaseDate: "2021-05-15",
    cost: 64500,
    qty: 1,
    qe: 64500,
    re: 20000,
    ia: 20,
    aa: 20,
    aca: false,
    active: true,
    personalUsePct: 10,
  },
];

export default function AssetContentArea() {
  const [groupByBatch, setGroupByBatch] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [boolFilters, setBoolFilters] = useState<Record<string, Set<boolean>>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const defaultColumns = useMemo(
    () => [
      { id: "id", label: "Asset ID", type: "string" as const, visible: true },
      { id: "batchId", label: "Batch ID", type: "string" as const, visible: true },
      { id: "name", label: "Asset Name", type: "string" as const, visible: true },
      { id: "group", label: "Asset Group", type: "string" as const, visible: true },
      { id: "description", label: "Description", type: "string" as const, visible: true },
      { id: "acquireDate", label: "Acquire Date", type: "string" as const, visible: true },
      { id: "purchaseDate", label: "Purchase Date", type: "string" as const, visible: true },
      { id: "cost", label: "Cost", type: "number" as const, visible: true },
      { id: "qty", label: "Qty", type: "number" as const, visible: true },
      { id: "qe", label: "QE", type: "number" as const, visible: true },
      { id: "re", label: "RE", type: "number" as const, visible: true },
      { id: "ia", label: "IA", type: "number" as const, visible: true },
      { id: "aa", label: "AA", type: "number" as const, visible: true },
      { id: "aca", label: "ACA", type: "boolean" as const, visible: true },
      { id: "active", label: "Active", type: "boolean" as const, visible: true },
      { id: "personalUsePct", label: "Personal Use %", type: "number" as const, visible: true },
    ],
    []
  );
  const [columns, setColumns] = useState(defaultColumns);
  const [dragColIndex, setDragColIndex] = useState<number | null>(null);
  const [showFilterRow, setShowFilterRow] = useState(true);
  const [headerMenu, setHeaderMenu] = useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });

  const filteredRows = useMemo(() => {
    const txtEntries = Object.entries(filters).filter(([, v]) => v?.trim());
    const boolEntries = Object.entries(boolFilters).filter(([, set]) => set && set.size > 0);
    return SAMPLE_ASSETS.filter((row) => {
      const textOk = txtEntries.every(([key, value]) => {
        const raw = (row as any)[key];
        if (raw === undefined || raw === null) return false;
        return String(raw).toLowerCase().includes(String(value).toLowerCase());
      });
      const boolOk = boolEntries.every(([key, set]) => set.has(Boolean((row as any)[key])));
      return textOk && boolOk;
    });
  }, [filters, boolFilters]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearRowFilters = () => {
    setFilters({});
    setBoolFilters({});
  };

  const visibleColumns = columns.filter((c) => c.visible);
  const resetColumns = () => {
    setColumns(defaultColumns.map((c) => ({ ...c })));
  };
  const handleHeaderContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setHeaderMenu({ open: true, x: e.clientX, y: e.clientY });
  };
  const closeHeaderMenu = () => setHeaderMenu((m) => ({ ...m, open: false }));
  const handleDragStart = (index: number) => setDragColIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (dropIndex: number) => {
    if (dragColIndex === null) return;
    if (dragColIndex === dropIndex) return;
    setColumns((prev) => {
      const cols = [...prev];
      const from = dragColIndex;
      const to = dropIndex;
      const moved = cols.splice(from, 1)[0];
      cols.splice(to, 0, moved);
      return cols;
    });
    setDragColIndex(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-surface border border-outline p-4">
          <div className="label-medium text-onSurface">Initial Allowance</div>
          <div className="title-small text-onSurface mt-1">RM 21.5K</div>
          <div className="body-small text-onSurfaceVariant">Current year</div>
        </Card>
        <Card className="bg-surface border border-outline p-4">
          <div className="label-medium text-onSurface">Annual Allowance</div>
          <div className="title-small text-onSurface mt-1">RM 64.5K</div>
          <div className="body-small text-onSurfaceVariant">Current year</div>
        </Card>
        <Card className="bg-surface border border-outline p-4">
          <div className="label-medium text-onSurface">Total Depreciation</div>
          <div className="title-small text-onSurface mt-1">RM 21.4K</div>
          <div className="body-small text-onSurfaceVariant">Current year</div>
        </Card>
      </div>

      {/* Unified Card wrapping header, controls, table and pagination (no border) */}
      <Card className="p-3">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="label-medium-bold text-onSurface">Asset Overview</div>
            <div className="flex bg-secondaryContainer text-onSecondaryContainer rounded overflow-hidden"
            onClick={() => setGroupByBatch(!groupByBatch)}>
              <button
                className={cn(
                  "px-3 py-1 body-small",
                  !groupByBatch && "bg-primary text-onPrimary"
                )}
              >
                Asset
              </button>
              <button
                className={cn(
                  "px-3 py-1 body-small",
                  groupByBatch && "bg-primary text-onPrimary"
                )}
              >
                Batch
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => {/* create new asset */}}>
              Add
            </Button>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
                <Button variant="outline" size="sm">Dispose</Button>
                <div className="body-small text-onSurfaceVariant">{selectedIds.size} selected</div>
              </div>
            )}
          </div>
        </div>

        {showColumnPanel && (
          <div
            className="fixed inset-0 bg-scrim z-50 flex items-center justify-center"
            onClick={() => setShowColumnPanel(false)}
          >
            <div
              className="bg-surfaceContainerHighest border border-outline rounded-lg p-4 w-[560px] max-w-[95vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="label-medium-bold text-onSurface">Columns</div>
                <button className="p-1 hover:bg-hover rounded" onClick={() => setShowColumnPanel(false)}>✕</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 body-small text-onSurface">
                {columns.map((col) => (
                  <label key={col.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setColumns((prev) => prev.map((c) => (c.id === col.id ? { ...c, visible: checked } : c)));
                      }}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-3 bg-surface border border-outline rounded overflow-hidden">
          {/* Column headers */}
          <div
            className="grid text-onSurface label-small border-b border-outline"
            style={{ gridTemplateColumns: `minmax(28px,auto) minmax(28px,auto) repeat(${visibleColumns.length}, minmax(0, 1fr))` }}
            onContextMenu={handleHeaderContextMenu}
          >
            {/* Hamburger menu cell */}
            <div className="flex items-center justify-center border-r border-outline">
              <button className="px-2 py-1 hover:bg-hover rounded" title="Columns" onClick={() => setShowColumnPanel((v) => !v)}>
                ☰
              </button>
            </div>
            {/* Select-all checkbox */}
            <div className="flex items-center justify-center border-r border-outline">
              <input
                type="checkbox"
                aria-label="Select all"
                onChange={(e) => {
                  if (e.target.checked) setSelectedIds(new Set(filteredRows.map((r) => r.id)));
                  else setSelectedIds(new Set());
                }}
              />
            </div>
            {visibleColumns.map((col) => (
              <div
                key={col.id}
                className="px-3 py-2 border-r border-outline select-none"
                draggable
                onDragStart={() => handleDragStart(columns.findIndex((c) => c.id === col.id))}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(columns.findIndex((c) => c.id === col.id))}
                title="Drag to reorder"
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Filter row */}
          {showFilterRow && (<div
            className="grid border-b border-outline"
            style={{ gridTemplateColumns: `minmax(28px,auto) minmax(28px,auto) repeat(${visibleColumns.length}, minmax(0, 1fr))` }}
          >
            <div className="border-r border-outline" />
            <div className="border-r border-outline" />
            {visibleColumns.map((col) => (
              <div key={col.id} className="min-w-0 px-0 py-0 border-r border-outline">
                {col.type === "boolean" ? (
                  <DropdownMenu className="w-full h-full">
                    <DropdownMenuTrigger
                      showIcon={false}
                      label={(() => {
                        const hasYes = Boolean(boolFilters[col.id]?.has(true));
                        const hasNo = Boolean(boolFilters[col.id]?.has(false));
                        if (hasYes && hasNo) return "Yes, No";
                        if (hasYes) return "Yes";
                        if (hasNo) return "No";
                        return "Filter...";
                      })()}
                      className="w-full h-full"
                    />
                    <DropdownMenuContent className="body-small" disablePortal>
                      {[
                        { label: "Yes", value: true },
                        { label: "No", value: false },
                      ].map((opt) => (
                        <DropdownMenuCheckboxItem
                          key={String(opt.value)}
                          checked={Boolean(boolFilters[col.id]?.has(opt.value))}
                          onClick={() => {
                            setBoolFilters((prev) => {
                              const set = new Set(prev[col.id] ?? []);
                              if (set.has(opt.value)) set.delete(opt.value);
                              else set.add(opt.value);
                              return { ...prev, [col.id]: set };
                            });
                          }}
                        >
                          {opt.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <input
                    value={filters[col.id] || ""}
                    onChange={(e) => setFilters((prev) => ({ ...prev, [col.id]: e.target.value }))}
                    placeholder="Filter..."
                    className="w-full h-full px-3 py-2 body-small text-onSurface bg-transparent outline-none"
                  />
                )}
              </div>
            ))}
          </div>)}

          {/* Body rows */}
          <div>
            {filteredRows.map((row) => (
              <div
                key={row.id}
                className="grid items-center body-small text-onSurface"
                style={{ gridTemplateColumns: `minmax(28px,auto) minmax(28px,auto) repeat(${visibleColumns.length}, minmax(0, 1fr))` }}
              >
                <div className="flex items-center justify-center border-t border-r border-outline h-full">
                  {/* Empty cell aligned with hamburger */}
                </div>
                <div className="flex items-center justify-center border-t border-r border-outline h-full">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    aria-label={`Select ${row.id}`}
                  />
                </div>
                {visibleColumns.map((col) => (
                  <div key={col.id} className="border-t border-r border-outline px-3 py-2 h-full flex items-center">
                    {(() => {
                      const val = (row as any)[col.id];
                      if (col.type === "boolean") return val ? "Yes" : "No";
                      if (col.type === "number") return typeof val === "number" ? val.toLocaleString() : val;
                      return col.id === "description" ? (
                        <span className="truncate block" title={String(val)}>{String(val)}</span>
                      ) : (
                        <span>{String(val)}</span>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ))}
            {filteredRows.length === 0 && (
              <div className="px-3 py-8 text-center body-medium text-onSurfaceVariant">No data</div>
            )}
          </div>
        </div>

        {/* Footer: only rows count, no box */}
        <div className="mt-2 body-small text-onSurfaceVariant">Rows: {filteredRows.length}</div>
      </Card>

      {/* Header context menu */}
      {headerMenu.open && (
        <div
          className="fixed z-50 bg-surfaceContainerHighest border border-outline rounded-lg shadow"
          style={{ top: headerMenu.y, left: headerMenu.x }}
          onMouseLeave={closeHeaderMenu}
        >
          <ul className="py-1 px-1">
            <li className="cursor-pointer rounded-md px-2 py-2 body-medium text-onSurface hover:bg-hover" onClick={() => { resetColumns(); closeHeaderMenu(); }}>Reset Column Header</li>
            <li className="cursor-pointer rounded-md px-2 py-2 body-medium text-onSurface hover:bg-hover" onClick={() => { setShowFilterRow((v) => !v); closeHeaderMenu(); if (showFilterRow) {clearRowFilters();} }}>{showFilterRow ? "Hide Filter" : "Show Filter"}</li>
          </ul>
        </div>
      )}
    </div>
  );
}


