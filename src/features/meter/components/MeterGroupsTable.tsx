import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AssetChip } from "@/components/AssetChip";
import { DataTableExtended } from "@/components/DataTableExtended";
import { Button, Badge } from "@/components/ui/components";
import type { MeterGroup } from "@/types/meter";

type MeterGroupsTableProps = {
  groups: MeterGroup[];
  onViewGroup: (group: MeterGroup) => void;
  onCloneGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
};

export const MeterGroupsTable = ({
  groups,
  onViewGroup,
  onCloneGroup,
  onDeleteGroup,
}: MeterGroupsTableProps) => {
  const columns = useMemo<ColumnDef<MeterGroup>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Group Name",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const group = row.original;
          return (
            <div className="flex flex-col gap-1">
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
      {
        id: "actions",
        header: "Actions",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const group = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloneGroup(group.id);
                }}
              >
                Clone
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(group.id);
                }}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [onCloneGroup, onDeleteGroup]
  );

  return (
    <DataTableExtended<MeterGroup, unknown>
      columns={columns}
      data={groups}
      showPagination
      onRowDoubleClick={onViewGroup}
    />
  );
};

export default MeterGroupsTable;
