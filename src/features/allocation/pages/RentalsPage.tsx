import { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import AllocationTable from "../components/AllocationTable";
import Search from "@/components/Search";
import RentalModal from "../components/RentalModal";
import type { AssetRecord, RentalPayload, RentalRecord } from "../types";
import { getRentalSummaryCards } from "../components/AllocationSummaryCards";
import { filterRentalsByQuery } from "../utils/filtering";

interface RentalsPageProps {
  assets: AssetRecord[];
  rentals: RentalRecord[];
  onCreateRental: (payload: RentalPayload) => void;
}

const RentalsPage: React.FC<RentalsPageProps> = ({ assets, rentals, onCreateRental }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  // Filter rentals based on search query
  const filteredRentals = useMemo(() => {
    return filterRentalsByQuery(rentals, searchQuery);
  }, [rentals, searchQuery]);

  const summaryCards = useMemo(
    () => getRentalSummaryCards(filteredRentals),
    [filteredRentals]
  );

  const handleRentalSubmit = (payload: RentalPayload) => {
    onCreateRental(payload);
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

export default RentalsPage;
