import { useState, useMemo } from "react";
import type { MeterGroup, Meter } from "@/types/meter";
import type { Asset } from "@/types/asset";
import { ExpandableCard } from "@/components/ExpandableCard";
import MeterGroupDetails from "./MeterGroupDetailsNew";
import { TablePagination } from "@/components/ui/components/Table";

type MeterGroupsListProps = {
  groups: MeterGroup[];
  availableAssets: Asset[];
  onViewGroup: (group: MeterGroup) => void;
  onCloneGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditMeter?: (groupId: string, meterId: string, meter: Meter) => void;
  onDeleteMeter?: (groupId: string, meterId: string) => void;
  onAssignAssets?: (groupId: string, assetIds: string[]) => void;
  itemsPerPage?: number;
};

export const MeterGroupsList = ({
  groups,
  availableAssets,
  onViewGroup,
  onCloneGroup,
  onDeleteGroup,
  onEditMeter,
  onDeleteMeter,
  onAssignAssets,
  itemsPerPage = 10,
}: MeterGroupsListProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = useMemo(
    () => groups.slice(startIndex, endIndex),
    [groups, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = (groupId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-onSurfaceVariant body-large">
          No meter groups found. Create a new group to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Groups List */}
      <div className="space-y-3">
        {currentGroups.map((group) => {
          const isExpanded = expandedIds.has(group.id);

          return (
            <ExpandableCard
              key={group.id}
              title={group.name}
              subtitle={group.description}
              stats={[
                {
                  label: "Meters",
                  value: group.meters.length,
                },
                {
                  label: "Assets",
                  value: group.assignedAssets.length,
                },
              ]}
              actions={[
                {
                  label: "View Details",
                  onClick: () => onViewGroup(group),
                },
                {
                  label: "Clone Group",
                  onClick: () => onCloneGroup(group.id),
                },
                {
                  label: "Delete Group",
                  onClick: () => onDeleteGroup(group.id),
                  variant: "destructive",
                },
              ]}
              isExpanded={isExpanded}
              onToggle={() => handleToggle(group.id)}
              expandable={group.meters.length > 0}
            >
              <MeterGroupDetails
                group={group}
                onEditMeter={(meter) => onEditMeter?.(group.id, meter.id, meter)}
                onDeleteMeter={(meterId) => onDeleteMeter?.(group.id, meterId)}
                availableAssets={availableAssets}
                onAssignAssets={(assetIds) => onAssignAssets?.(group.id, assetIds)}
              />
            </ExpandableCard>
          );
        })}
      </div>

      {/* Pagination */}
      {groups.length > itemsPerPage && (
        <TablePagination
          totalCount={groups.length}
          currentPage={currentPage - 1}
          pageSize={itemsPerPage}
          onPageChange={(page) => handlePageChange(page + 1)}
          onPageSizeChange={(_size) => {
            setCurrentPage(1);
            // Note: itemsPerPage is currently fixed. To make it dynamic, lift this state up or add local state
          }}
        />
      )}
    </div>
  );
};

export default MeterGroupsList;
