import { useEffect, useMemo, useState, useCallback } from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import WorkRequestTab from "./WorkRequestTab";
import { CreateWorkRequestModal } from "../components/CreateWorkRequestModal";
import { ReviewWorkRequestModal } from "../components/ReviewWorkRequestModal";
import { useGetWorkRequests } from "../hooks/useWorkRequestService";
import type { WorkRequest, WorkRequestFilters } from "../types";

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
  const [filters, setFilters] = useState<WorkRequestFilters>(DEFAULT_FILTERS);
  const [selectedWorkRequestIds, setSelectedWorkRequestIds] = useState<string[]>([]);
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<WorkRequest | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Custom hooks
  const { data: workRequests = [], isLoading } = useGetWorkRequests();

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

  const handleSelectionChange = (selectedWorkRequests: WorkRequest[]) => {
    setSelectedWorkRequestIds(selectedWorkRequests.map(wr => wr.id));
  };

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenReviewModal = useCallback((workRequest: WorkRequest) => {
    setSelectedWorkRequest(workRequest);
    setIsReviewModalOpen(true);
  }, []);

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedWorkRequest(null);
  };

  const handleWorkRequestSuccess = useCallback(() => {
    // Query will be automatically refetched by React Query
    setSelectedWorkRequestIds([]);
  }, []);

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Work Requests" },
      ]}
    >
      <div className="flex flex-col gap-4 min-h-full">

        <div className="px-4 pb-4">
          <WorkRequestTab
            workRequests={filteredWorkRequests}
            filters={filters}
            selectedWorkRequestIds={selectedWorkRequestIds}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
            onSelectionChange={handleSelectionChange}
            onOpenCreateModal={handleOpenCreateModal}
            onOpenReviewModal={handleOpenReviewModal}
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
    </AppLayout>
  );
};

export default WorkRequestPage;
