import { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import AllocationTable from "../AllocationTable";
import Search from "@/components/Search";
import { MOCK_RENTALS } from "../../mockData.ts";
import { getRentalSummaryCards } from "../AllocationSummaryCards.tsx";

const RentalsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="flex h-full flex-col gap-6 p-2">
      <TabHeader
        title="Asset Rental"
        subtitle="Manage customer rentals, scheduling windows, and required assets."
        actions={[
          {
            label: "Rent Asset",
            size: "sm",
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
    </div>
  );
};

export default RentalsTab;
