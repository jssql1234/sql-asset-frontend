import { AppLayout } from "@/layout/sidebar/AppLayout";
import Tabs from "@/components/ui/components/Tabs";
import AllocationModal from "../components/AllocationModal";
import { useAllocationState } from "../hooks/useAllocationState";
import { getAllocationTabs } from "../hooks/useAllocationTabs";
import { useMemo } from "react";

const AllocationPage: React.FC = () => {
  const { filteredAssets, summary, isAllocationModalOpen, assets,
    openAllocationModal, closeAllocationModal, handleAllocationSubmit,
  } = useAllocationState();

  // Extract unique locations and users from assets for modal dropdowns
  const locations = useMemo(() => {
    const locationSet = new Set(filteredAssets.map(asset => asset.location));
    return Array.from(locationSet).sort();
  }, [filteredAssets]);

  const users = useMemo(() => {
    const userSet = new Set(filteredAssets.map(asset => asset.pic));
    return Array.from(userSet).sort();
  }, [filteredAssets]);

  const tabs = getAllocationTabs({ filteredAssets, summary,
    onOpenAllocationModal: openAllocationModal,
  });

  return (
    <AppLayout
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
        users={users}
      />
    </AppLayout>
  );
};

export default AllocationPage;
