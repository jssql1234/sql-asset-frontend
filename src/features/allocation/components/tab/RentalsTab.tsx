import { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import AllocationTable from "../AllocationTable";
import Search from "@/components/Search";
import RentalModal from "../RentalModal";
import type { RentalPayload } from "../RentalModal";
import type { AssetRecord } from "../../types";
import { MOCK_RENTALS } from "../../mockData.ts";
import { getRentalSummaryCards } from "../AllocationSummaryCards.tsx";

interface RentalsTabProps {
  assets: AssetRecord[];
}

const RentalsTab: React.FC<RentalsTabProps> = ({ assets }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  // Filter rentals based on search query
  const filteredRentals = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_RENTALS;

    const query = searchQuery.toLowerCase();
    return MOCK_RENTALS.filter((rental) =>
      rental.assetName.toLowerCase().includes(query) ||
      rental.customerName.toLowerCase().includes(query) ||
      rental.status.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const summaryCards = useMemo(
    () => getRentalSummaryCards(filteredRentals),
    [filteredRentals]
  );

  const handleRentalSubmit = (payload: RentalPayload) => {
    console.log("Rental payload:", payload);
    // TODO: Implement rental submission logic
  };

  return (
    <div className="flex h-full flex-col gap-6 p-2">
      <TabHeader
        title="Asset Rental"
        subtitle="Manage customer rentals, scheduling windows, and required assets."
        actions={[
          {
            label: "Rent Asset",
            size: "sm",
            onAction: () => { setIsRentalModalOpen(true); },
          },
        ]}
      />

      <SummaryCards data={summaryCards} columns={4} />

      <Search
        searchValue={searchQuery}
        searchPlaceholder="Search by asset, customer, or status"
        onSearch={setSearchQuery}
        live
      />

    <div className="flex-1 border-t border-outline">
       <AllocationTable variant="rental" rentals={filteredRentals} />
      </div>

      <RentalModal
        isOpen={isRentalModalOpen}
        assets={assets}
        onClose={() => { setIsRentalModalOpen(false); }}
        onSubmit={handleRentalSubmit}
      />
    </div>
  );
};

export default RentalsTab;
