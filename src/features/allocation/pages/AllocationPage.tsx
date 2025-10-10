import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
import Tabs from "@/components/ui/components/Tabs";
import AllocationModal from "../components/AllocationModal";
import { useAllocationState } from "../hooks/useAllocationState";
import { useAllocationTabs } from "../hooks/useAllocationTabs";

const AllocationPage: React.FC = () => {
  const { filters, filteredAssets, summary, isAllocationModalOpen, locations, pics, assets,
    handleFilterChange, openAllocationModal, closeAllocationModal, handleAllocationSubmit,
  } = useAllocationState();

  const tabs = useAllocationTabs({ filteredAssets, filters, summary,
    onFilterChange: handleFilterChange, onOpenAllocationModal: openAllocationModal,
  });

  return (
    <SidebarHeader
      breadcrumbs={[ { label: "Asset Maintenance" }, { label: "Allocation" } ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <Tabs tabs={tabs} defaultValue="allocation" />
      </div>

      <AllocationModal
        isOpen={isAllocationModalOpen}
        onClose={closeAllocationModal}
        onSubmit={handleAllocationSubmit}
        assets={assets}
        locations={locations}
        users={pics}
      />
    </SidebarHeader>
  );
};

export default AllocationPage;