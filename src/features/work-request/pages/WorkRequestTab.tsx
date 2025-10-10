import React, { useState } from "react";
import { Card } from "@/components/ui/components";
import { useToast } from "@/components/ui/components/Toast";
import TabHeader from "@/components/TabHeader";
import WorkRequestFilter, { type FilterOptions } from "../components/WorkRequestFilter";
import WorkRequestTable from "../components/WorkRequestTable";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import type { WorkRequest, WorkRequestFilters } from "@/types/work-request";

interface WorkRequestTabProps {
  workRequests: WorkRequest[];
  filters: WorkRequestFilters;
  filterOptions: FilterOptions;
  selectedWorkRequestIds: string[];
  isLoading?: boolean;
  onFilterChange: (filters: WorkRequestFilters) => void;
  onResetFilters: () => void;
  onSelectionChange: (workRequests: WorkRequest[]) => void;
  onOpenCreateModal?: () => void;
  onOpenReviewModal?: () => void;
  onDelete?: (requestId: string) => void;
}

const WorkRequestTab: React.FC<WorkRequestTabProps> = ({
  workRequests,
  filters,
  filterOptions,
  selectedWorkRequestIds,
  isLoading = false,
  onFilterChange,
  onResetFilters,
  onSelectionChange,
  onOpenCreateModal,
  onOpenReviewModal,
  onDelete,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingItems, setIsDeletingItems] = useState(false);
  const { addToast } = useToast();


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

      <WorkRequestFilter
        filters={filters}
        options={filterOptions}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      <Card className="flex flex-col gap-4 border border-outline bg-surfaceContainer p-0 min-h-[500px]">
        <div className="border-t border-outline">
          <WorkRequestTable
            workRequests={workRequests}
            selectedWorkRequestIds={selectedWorkRequestIds}
            isLoading={isLoading}
            onSelectionChange={onSelectionChange}
            onEditWorkRequest={onOpenReviewModal}
          />
        </div>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          if (selectedWorkRequestIds.length > 0 && onDelete) {
            setIsDeletingItems(true);
            const itemCount = selectedWorkRequestIds.length;
            const deletedItems = selectedWorkRequestIds.map(id => {
              const workRequest = workRequests.find(wr => wr.id === id);
              return workRequest?.requestId || id;
            });
            
            try {
              // Delete the items
              selectedWorkRequestIds.forEach(id => onDelete(id));
              
              // Close dialog first
              setIsDeleteDialogOpen(false);
              
              // Clear selected items after successful deletion
              // Use setTimeout to ensure the deletion and state updates are complete
              setTimeout(() => {
                onSelectionChange([]);
              }, 100);
              
              // Show success toast
              const successTitle = itemCount === 1 
                ? "Work Request Deleted" 
                : `${itemCount} Work Requests Deleted`;
                
              const successMessage = itemCount === 1
                ? `Work request ${deletedItems[0]} has been successfully deleted.`
                : itemCount <= 3
                  ? `Work requests ${deletedItems.join(', ')} have been successfully deleted.`
                  : `Work requests ${deletedItems.slice(0, 2).join(', ')} and ${itemCount - 2} others have been successfully deleted.`;
                
              addToast({
                variant: "success",
                title: successTitle,
                description: successMessage,
                duration: 8000,
                dismissible: true
              });
            } catch (error) {
              console.error('Error deleting work requests:', error);
              
              // Show error toast
              addToast({
                variant: "error",
                title: "Deletion Failed",
                description: "An error occurred while deleting the work request(s). Please try again.",
                duration: 15000,
                dismissible: true
              });
            } finally {
              setIsDeletingItems(false);
            }
          }
        }}
        itemCount={selectedWorkRequestIds.length}
        itemType="work request"
        isLoading={isDeletingItems}
        itemIds={selectedWorkRequestIds.map(id => {
          const workRequest = workRequests.find(wr => wr.id === id);
          return workRequest?.requestId || id;
        })}
        itemNames={selectedWorkRequestIds.map(id => {
          const workRequest = workRequests.find(wr => wr.id === id);
          return workRequest ? `${workRequest.requesterName} - ${workRequest.problemDescription.slice(0, 50)}${workRequest.problemDescription.length > 50 ? '...' : ''}` : '';
        })}
      />
    </div>
  );
};

export default WorkRequestTab;