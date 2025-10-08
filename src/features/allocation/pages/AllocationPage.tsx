import { SidebarLayout } from "@/layout/sidebar/sidebar-layout";
import Tabs from "@/components/ui/components/Tabs";
import AllocationModal from "../components/modal/AllocationModal";
import TransferModal from "../components/modal/TransferModal";
import ReturnModal from "../components/modal/ReturnModal";
import { useAllocationState } from "../hooks/useAllocationState";
import { useAllocationTabs } from "../hooks/useAllocationTabs";

const AllocationPage: React.FC = () => {
  const {
    filters,
    selectedAssetIds,
    filteredAssets,
    summary,
    isAllocationModalOpen,
    isTransferModalOpen,
    isReturnModalOpen,
    locations,
    pics,
    statuses,
    assets,
    handleFilterChange,
    handleSelectionChange,
    openAllocationModal,
    openTransferModal,
    openReturnModal,
    closeAllocationModal,
    closeTransferModal,
    closeReturnModal,
    handleAllocationSubmit,
  } = useAllocationState();

  const tabs = useAllocationTabs({
    filteredAssets,
    filters,
    summary,
    locations,
    pics,
    statuses,
    selectedAssetIds,
    onFilterChange: handleFilterChange,
    onSelectionChange: handleSelectionChange,
    onOpenAllocationModal: openAllocationModal,
    onOpenTransferModal: openTransferModal,
    onOpenReturnModal: openReturnModal,
  });

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Asset Maintenance", href: "/" },
        { label: "Allocation" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <Tabs tabs={tabs} defaultValue="allocation" />
      </div>

      <AllocationModal
        isOpen={isAllocationModalOpen}
        onClose={closeAllocationModal}
        onSubmit={handleAllocationSubmit}
        assets={assets}
        selectedAssetIds={selectedAssetIds}
        locations={locations}
        users={pics}
      />
      <TransferModal isOpen={isTransferModalOpen} onClose={closeTransferModal} />
      <ReturnModal isOpen={isReturnModalOpen} onClose={closeReturnModal} />
    </SidebarLayout>
  );
};

export default AllocationPage;