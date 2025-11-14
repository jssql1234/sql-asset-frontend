import { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import AllocationTable from "../components/AllocationTable";
import RentalModal from "../components/RentalModal";
import type { AssetRecord, RentalPayload, RentalRecord } from "../types";
import { getRentalSummaryCards } from "../components/AllocationSummaryCards";

interface RentalsPageProps {
  assets: AssetRecord[];
  rentals: RentalRecord[];
  onCreateRental: (payload: RentalPayload) => void;
}

const RentalsPage: React.FC<RentalsPageProps> = ({ assets, rentals, onCreateRental }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  const summaryCards = useMemo(
    () => getRentalSummaryCards(rentals),
    [rentals]
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

      <div className="flex-1">
        <AllocationTable 
          variant="rental" 
          rentals={rentals} 
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchPlaceholder="Search by asset, customer, or status"
        />
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
