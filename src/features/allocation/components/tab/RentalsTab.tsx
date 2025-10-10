import { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import AllocationTable from "../AllocationTable";
import Search from "@/components/Search";
import { MOCK_RENTALS } from "../../mockData.ts";
import { getRentalSummaryCards } from "../AllocationSummaryCards.tsx";
import type {
  RentalFilters as RentalFiltersState,
  RentalRecord,
} from "../../types.ts";

const DEFAULT_FILTERS: RentalFiltersState = {
  search: "",
};

const RentalsTab: React.FC = () => {
  const [filters, setFilters] = useState<RentalFiltersState>(DEFAULT_FILTERS);

  const filteredRentals = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return MOCK_RENTALS.filter((rental) => {
      const target =
        `${rental.assetName} ${rental.customerName} ${rental.status}`.toLowerCase();
      return normalizedSearch ? target.includes(normalizedSearch) : true;
    });
  }, [filters.search]);

  const summaryCards = useMemo(
    () => getRentalSummaryCards(filteredRentals),
    [filteredRentals]
  );

  const rentalsForTable: RentalRecord[] = filteredRentals;

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
        searchValue={filters.search}
        searchPlaceholder="Search by asset, customer, or status"
        onSearch={(value) => setFilters((prev) => ({ ...prev, search: value }))}
        live
      />

    <div className="flex-1 border-t border-outline">
       <AllocationTable variant="rental" rentals={rentalsForTable} />
      </div>
    </div>
  );
};

export default RentalsTab;
