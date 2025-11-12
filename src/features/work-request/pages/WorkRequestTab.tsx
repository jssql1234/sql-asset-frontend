import React from "react";
import TabHeader from "@/components/TabHeader";
import Search from "@/components/Search";
import WorkRequestTable from "../components/WorkRequestTable";
import type { WorkRequest, WorkRequestFilters } from "../types";
import { Plus } from '@/assets/icons';

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
        customActions={
          <button
            onClick={onOpenCreateModal}
            disabled={!onOpenCreateModal}
            className="flex items-center gap-2 px-2.5 py-1.5 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        }
      />

      {/* Remove the separate search bar section and border */}
      <WorkRequestTable
        workRequests={workRequests}
        isLoading={isLoading}
        onSelectionChange={onSelectionChange}
        onReviewWorkRequest={onOpenReviewModal}
        searchComponent={
          <div className="flex-shrink-0 w-80">
            <Search
              searchValue={filters.search || ""}
              searchPlaceholder="Search work requests..."
              onSearch={(value) => onFilterChange({ ...filters, search: value })}
              live={true}
              inputClassName="h-10 w-full"
              showLiveSearchIcon={true}
            />
          </div>
        }
      />
    </div>
  );
};

export default WorkRequestTab;