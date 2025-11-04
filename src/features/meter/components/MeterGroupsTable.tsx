import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { AssetChip } from "@/components/AssetChip";
import {
  DataTableExtended,
  type RowAction,
} from "@/components/DataTableExtended";
import { Badge } from "@/components/ui/components";
import type { MeterGroup, Meter } from "@/types/meter";
import { Copy, ChevronDown, ChevronRight } from "lucide-react";
import MeterGroupDetails from "./MeterGroupDetails";

type MeterGroupsTableProps = {
  groups: MeterGroup[];
  onViewGroup: (group: MeterGroup) => void;
  onCloneGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditMeter: (meter: Meter) => void;
  onDeleteMeter: (meterId: string) => void;
};

export const MeterGroupsTable = ({
  groups,
  onViewGroup,
  onCloneGroup,
  onDeleteGroup,
  onEditMeter,
  onDeleteMeter,
}: MeterGroupsTableProps) => {
  const columns = useMemo<ColumnDef<MeterGroup>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        size: 40,
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          return row.original.meters.length > 0 ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="flex items-center justify-center p-1 hover:bg-surfaceContainerHighest rounded transition-colors"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4 text-onSurfaceVariant" />
              ) : (
                <ChevronRight className="h-4 w-4 text-onSurfaceVariant" />
              )}
            </button>
          ) : null;
        },
      },
      {
        accessorKey: "name",
        header: "Group Name",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const group = row.original;
          return (
            <div className="flex flex-col gap-1 ">
              <span className="font-semibold text-onSurface">{group.name}</span>
              {group.description && (
                <span className="body-small text-onSurfaceVariant">
                  {group.description}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "meters",
        header: "Meters",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const meters = row.original.meters;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-onSurface">
                {meters.length} {meters.length === 1 ? "meter" : "meters"}
              </span>
              {meters.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {meters.slice(0, 3).map((meter) => (
                    <Badge
                      key={meter.id}
                      text={`${meter.uom}`}
                      variant="primary"
                      className="h-6 px-2 py-0.5 text-xs"
                    />
                  ))}
                  {meters.length > 3 && (
                    <Badge
                      text={`+${meters.length - 3} more`}
                      variant="primary"
                      className="h-6 px-2 py-0.5 text-xs"
                    />
                  )}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "assignedAssets",
        header: "Assigned Assets",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const assets = row.original.assignedAssets;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-onSurface">
                {assets.length} {assets.length === 1 ? "asset" : "assets"}
              </span>
              {assets.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {assets.slice(0, 2).map((asset) => (
                    <AssetChip key={asset.id} asset={asset} />
                  ))}
                  {assets.length > 2 && (
                    <Badge
                      text={`+${assets.length - 2} more`}
                      variant="primary"
                      className="h-6 px-2 py-0.5 text-xs"
                    />
                  )}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const rowActions: RowAction<MeterGroup>[] = useMemo(
    () => [
      {
        type: "view",
        onClick: (group) => {
          onViewGroup(group);
        },
      },
      {
        type: "custom",
        label: "Clone",
        icon: Copy,
        onClick: (group) => {
          onCloneGroup(group.id);
        },
      },
      {
        type: "delete",
        onClick: (group) => {
          onDeleteGroup(group.id);
        },
      },
    ],
    [onViewGroup, onCloneGroup, onDeleteGroup]
  );

  // Render sub-component for expanded rows showing meter details
  const renderSubComponent = ({ row }: { row: Row<MeterGroup> }) => {
    return (
      <MeterGroupDetails
        group={row.original}
        onEditMeter={onEditMeter}
        onDeleteMeter={onDeleteMeter}
      />
    );
  };

  return (
    <DataTableExtended
      columns={columns}
      data={groups}
      showPagination
      rowActions={rowActions}
      enableGrouping={false}
      getRowCanExpand={(row) => row.original.meters.length > 0}
      renderSubComponent={renderSubComponent}
    />
  );
};

export default MeterGroupsTable;
