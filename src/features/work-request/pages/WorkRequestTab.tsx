import React from "react";
import TabHeader from "@/components/TabHeader";
import Search from "@/components/Search";
import WorkRequestTable from "../components/WorkRequestTable";
import type { WorkRequest, WorkRequestFilters } from "../types";

interface WorkRequestTabProps {
  workRequests: WorkRequest[];
  filters: WorkRequestFilters;
  selectedWorkRequestIds: string[];
  isLoading?: boolean;
  onFilterChange: (filters: WorkRequestFilters) => void;
  onSelectionChange: (workRequests: WorkRequest[]) => void;
  onOpenCreateModal?: () => void;
  onOpenReviewModal?: (workRequest: WorkRequest) => void;
}

const WorkRequestTab: React.FC<WorkRequestTabProps> = ({
  workRequests,
  filters,
  isLoading = false,
  onFilterChange,
  onSelectionChange,
  onOpenCreateModal,
  onOpenReviewModal,
}) => {

  return (
    <div className="flex flex-col gap-6">
      <TabHeader
        title="Work Requests"
        subtitle="Manage maintenance requests, track progress, and coordinate work orders."
        actions={[
          {
            label: "New Request",
            onAction: onOpenCreateModal,
            disabled: !onOpenCreateModal,
          },
        ]}
      />

      <Search
        searchValue={filters.search || ""}
        searchPlaceholder="Search work requests..."
        onSearch={(value) => onFilterChange({ ...filters, search: value })}
        live={true}
        showLiveSearchIcon={true}
      />

      <div className="border-t border-outline">
        <WorkRequestTable
          workRequests={workRequests}
          isLoading={isLoading}
          onSelectionChange={onSelectionChange}
          onReviewWorkRequest={onOpenReviewModal}
        />
      </div>
    </div>
  );
};

export default WorkRequestTab;