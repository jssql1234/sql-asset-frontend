import { useEffect, useMemo, useState, useCallback } from "react";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
import { useToast } from "@/components/ui/components/Toast";
import WorkRequestTab from "./WorkRequestTab";
import { CreateWorkRequestModal } from "../components/CreateWorkRequestModal";
import { ReviewWorkRequestModal } from "../components/ReviewWorkRequestModal";
import { useUserManagement } from "../hooks/useUserManagement";
import { workRequestService } from "../services/workRequestService";
import type { WorkRequest, WorkRequestFilters } from "@/types/work-request";

const DEFAULT_FILTERS: WorkRequestFilters = {
  search: "",
  status: "",
  type: "",
  department: "",
  requester: "",
  asset: "",
  date: "",
  description: "",
};

const WorkRequestPage: React.FC = () => {
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([]);
  const [filters, setFilters] = useState<WorkRequestFilters>(DEFAULT_FILTERS);
  const [selectedWorkRequestIds, setSelectedWorkRequestIds] = useState<string[]>([]);
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<WorkRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Custom hooks
  const { changeTestUser, getUserDisplayText } = useUserManagement();
  const { addToast } = useToast();

  // Load work requests on component mount
  useEffect(() => {
    const loadWorkRequests = async () => {
      try {
        setIsLoading(true);
        
        const requests = workRequestService.getWorkRequests();
        setWorkRequests(requests);
      } catch (error) {
        console.error('Error loading work requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkRequests();
  }, []);

  // Handle review button clicks from table actions
  useEffect(() => {
    const handleReviewFromTable = (event: CustomEvent) => {
      const workRequest = event.detail as WorkRequest;
      setSelectedWorkRequest(workRequest);
      setIsReviewModalOpen(true);
    };

    window.addEventListener('reviewWorkRequest', handleReviewFromTable as EventListener);
    return () => {
      window.removeEventListener('reviewWorkRequest', handleReviewFromTable as EventListener);
    };
  }, []);

  // Filter options
  const filterOptions = useMemo(() => {
    const departments = [...new Set(workRequests.map(wr => wr.department))];
    const requesters = [...new Set(workRequests.map(wr => wr.requesterName))];
    const statuses: WorkRequest['status'][] = ['Pending', 'Approved', 'Rejected'];
    const types: WorkRequest['requestType'][] = ['Maintenance', 'Repair', 'Inspection', 'Emergency'];

    return {
      departments,
      requesters,
      statuses,
      types,
    };
  }, [workRequests]);

  // Filtered work requests
  const filteredWorkRequests = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return workRequests.filter((workRequest) => {
      const matchesSearch = normalizedSearch
        ? `${workRequest.requestId} ${workRequest.requesterName} ${workRequest.department} ${workRequest.problemDescription}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesStatus = filters.status ? workRequest.status === filters.status : true;
      const matchesType = filters.type ? workRequest.requestType === filters.type : true;
      const matchesDepartment = filters.department ? workRequest.department === filters.department : true;
      const matchesRequester = filters.requester ? workRequest.requesterName === filters.requester : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesDepartment &&
        matchesRequester
      );
    });
  }, [workRequests, filters]);

  // Clear selection when filtered results change
  useEffect(() => {
    setSelectedWorkRequestIds((prev) =>
      prev.filter((id) => filteredWorkRequests.some((wr) => wr.id === id))
    );
  }, [filteredWorkRequests]);



  // Event handlers
  const handleFilterChange = (nextFilters: WorkRequestFilters) => {
    setFilters(nextFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSelectionChange = (selectedWorkRequests: WorkRequest[]) => {
    setSelectedWorkRequestIds(selectedWorkRequests.map(wr => wr.id));
  };

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenReviewModal = useCallback(() => {
    if (selectedWorkRequestIds.length !== 1) {
      alert('Please select exactly one work request to review.');
      return;
    }

    const workRequest = workRequests.find(wr => wr.id === selectedWorkRequestIds[0]);
    if (workRequest) {
      setSelectedWorkRequest(workRequest);
      setIsReviewModalOpen(true);
    }
  }, [selectedWorkRequestIds, workRequests]);

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedWorkRequest(null);
  };



  const handleWorkRequestSuccess = useCallback(() => {
    // Refresh work requests
    const updatedRequests = workRequestService.getWorkRequests();
    setWorkRequests(updatedRequests);
    setSelectedWorkRequestIds([]);
  }, []);

  const handleDeleteWorkRequest = useCallback((requestId: string) => {
    console.log('Delete work request called with ID:', requestId);
    const workRequest = workRequests.find(wr => wr.id === requestId);
    const displayId = workRequest?.requestId || requestId;
    
    try {
      workRequestService.deleteWorkRequest(requestId);
      // Refresh work requests
      const updatedRequests = workRequestService.getWorkRequests();
      setWorkRequests(updatedRequests);
      
      // Note: Selection clearing is handled by WorkRequestTab onConfirm
      // Don't clear selections here to avoid conflicts
      console.log('Work request deleted successfully');
    } catch (error) {
      console.error('Error deleting work request:', error);
      // Only show error toast if the deletion fails at this level
      addToast({
        variant: "error",
        title: "Deletion Failed",
        description: `Failed to delete work request ${displayId}. Please try again.`,
        duration: 5000,
        dismissible: true
      });
    }
  }, [workRequests, addToast]);



  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Work Requests" },
      ]}
    >
      <div className="flex flex-col gap-4 min-h-full">
        {/* User Controls */}
        <div className="flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-onSurfaceVariant text-sm">User:</span>
            <span className="font-medium text-onSurface">{getUserDisplayText()}</span>
            <button
              onClick={changeTestUser}
              className="px-3 py-1 text-sm border border-outline rounded-md hover:bg-surfaceContainerHighest transition-colors"
            >
              Switch User
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Create a test work request to test delete functionality
                try {
                  workRequestService.createWorkRequest({
                    requesterName: 'Test User',
                    department: 'Test Department',
                    selectedAssets: [{
                      main: {
                        code: 'TEST-001',
                        name: 'Test Asset',
                        description: 'Test asset for delete functionality',
                        location: 'Test Location'
                      }
                    }],
                    requestType: 'Maintenance',
                    problemDescription: 'Test work request for delete functionality testing',
                    additionalNotes: 'This is a test request to verify delete button works',
                    status: 'Pending',
                    photos: []
                  });
                  // Refresh the list
                  const updatedRequests = workRequestService.getWorkRequests();
                  setWorkRequests(updatedRequests);
                  console.log('Test work request created successfully');
                } catch (error) {
                  console.error('Error creating test work request:', error);
                }
              }}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Test Request
            </button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <WorkRequestTab
            workRequests={filteredWorkRequests}
            filters={filters}
            filterOptions={filterOptions}
            selectedWorkRequestIds={selectedWorkRequestIds}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectionChange={handleSelectionChange}
            onOpenCreateModal={handleOpenCreateModal}
            onOpenReviewModal={handleOpenReviewModal}
            onDelete={handleDeleteWorkRequest}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateWorkRequestModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleWorkRequestSuccess}
      />
      
      <ReviewWorkRequestModal
        isOpen={isReviewModalOpen}
        workRequest={selectedWorkRequest}
        onClose={handleCloseReviewModal}
        onSuccess={handleWorkRequestSuccess}
        onReject={() => {}}
      />
    </SidebarHeader>
  );
};

export default WorkRequestPage;