import { useMemo, useState } from "react";
import { Button, Card } from "@/components/ui/components";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import Table from "../Table.tsx";
import { MOCK_RENTALS, MOCK_RENTAL_STATUS, MOCK_RENTAL_LOCATIONS } from "../../mockData.ts";
import RentalFiltersPanel from "../RentalFilters.tsx";
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

  const summaryCards = useMemo(() => {
    const stats = filteredRentals.reduce(
      (acc, rental) => {
        acc.total += 1;
        acc[rental.status] = (acc[rental.status] ?? 0) + 1;
        acc.totalIncome += rental.quantity * 50; // Assume $50 per unit
        return acc;
      },
      { total: 0, totalIncome: 0 } as Record<string, number>
    );

    return [
      {
        label: "Active Rentals",
        value: stats.Active ?? 0,
        description: "Currently in progress",
        tone: "success" as const,
      },
      {
        label: "Scheduled Rentals",
        value: stats.Scheduled ?? 0,
        description: "Upcoming reservations",
        tone: "warning" as const,
      },
      {
        label: "Completed Rentals",
        value: stats.Completed ?? 0,
        description: "Successfully finished",
        tone: "default" as const,
      },
      {
        label: "Total Income",
        value: `RM ${stats.totalIncome.toLocaleString()}`,
        description: "From all rentals",
        tone: "success" as const,
      },
    ];
  }, [filteredRentals]);

  const handleFilterChange = (next: RentalFiltersState) => {
    setFilters(next);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

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

      <RentalFiltersPanel
        filters={filters}
        statuses={MOCK_RENTAL_STATUS}
        locations={MOCK_RENTAL_LOCATIONS}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <Card className="flex flex-1 flex-col gap-4 border border-outline bg-surfaceContainer p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h3 className="title-small text-onSurface">Rental Inventory</h3>
            <p className="body-small text-onSurfaceVariant">
              {rentalsForTable.length} records • Viewing filtered rentals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              Export List
            </Button>
            <Button variant="outline" size="sm">
              View Calendar
            </Button>
          </div>
        </div>
        <div className="flex-1 border-t border-outline">
          <Table variant="rental" rentals={rentalsForTable} />
        </div>
      </Card>
    </div>
  );
};

export default RentalsTab;
