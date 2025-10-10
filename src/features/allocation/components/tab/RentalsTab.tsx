import { useMemo, useState } from "react";
import { Card } from "@/components/ui/components";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import AllocationTable from "../AllocationTable";
import { MOCK_RENTALS, MOCK_RENTAL_STATUS, MOCK_RENTAL_LOCATIONS } from "../../mockData.ts";
import { RentalFilter } from "../AllocationSearchFilter";
import { getRentalSummaryCards } from "../AllocationSummaryCards.tsx";
import type { RentalFilters as RentalFiltersState, RentalRecord } from "../../types.ts";

const DEFAULT_FILTERS: RentalFiltersState = {
  search: "",
  status: "",
  location: "",
};

const RentalsTab: React.FC = () => {
  const [filters, setFilters] = useState<RentalFiltersState>(DEFAULT_FILTERS);

  const filteredRentals = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return MOCK_RENTALS.filter((rental) => {
      const target = `${rental.assetName} ${rental.customerName} ${rental.status}`.toLowerCase();
      const matchesSearch = normalizedSearch ? target.includes(normalizedSearch) : true;
      const matchesStatus = filters.status ? rental.status === filters.status : true;
      const matchesLocation = filters.location ? rental.location === filters.location : true;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [filters]);

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

      <RentalFilter
        filters={filters}
        statuses={MOCK_RENTAL_STATUS}
        locations={MOCK_RENTAL_LOCATIONS}
        onFiltersChange={(partialFilters) =>
          setFilters((prev) => ({ ...prev, ...partialFilters }))
        }
      />

      <Card className="flex flex-1 flex-col gap-1 border border-outline bg-surfaceContainer p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h3 className="title-small text-onSurface">Rental Inventory</h3>
            <p className="body-small text-onSurfaceVariant">
              {rentalsForTable.length} records • Viewing filtered rentals
            </p>
          </div>
        </div>
        <div className="flex-1 border-t border-outline">
          <AllocationTable variant="rental" rentals={rentalsForTable} />
        </div>
      </Card>
    </div>
  );
};

export default RentalsTab;
