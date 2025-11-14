import { lazy, Suspense, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Tabs } from "@/components/ui/components";
import { useAllocationState } from "../hooks/useAllocationState";

const AllocationPage = lazy(() => import("./AllocationPage"));
const RentalsPage = lazy(() => import("./RentalsPage"));
const CalendarPage = lazy(() => import("./CalendarPage"));

const AllocationMainPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const {
    assets,
    rentals,
    calendarEvents,
    summary,
    locations,
    users,
    isAllocationModalOpen,
    openAllocationModal,
    closeAllocationModal,
    handleAllocationSubmit,
    handleRentalSubmit,
  } = useAllocationState();

  const defaultTab = tabFromUrl === "rentals" || tabFromUrl === "calendar" ? tabFromUrl : "allocation";

  const handleTabChange = useCallback((value: string) => {
    if (value === "allocation") {
      setSearchParams({});
    } else {
      setSearchParams({ tab: value });
    }
  }, [setSearchParams]);

  const tabs = useMemo(() => [
    {
      label: "Allocation",
      value: "allocation",
      content: (
        <Suspense fallback={<div className="p-4 text-onSurfaceVariant">Loading allocation...</div>}>
          <AllocationPage 
            assets={assets}
            summary={summary}
            locations={locations}
            users={users}
            isAllocationModalOpen={isAllocationModalOpen}
            onOpenAllocationModal={openAllocationModal}
            onCloseAllocationModal={closeAllocationModal}
            onAllocationSubmit={handleAllocationSubmit}
          />
        </Suspense>
      ),
    },
    {
      label: "Rentals",
      value: "rentals",
      content: (
        <Suspense fallback={<div className="p-4 text-onSurfaceVariant">Loading rentals...</div>}>
          <RentalsPage 
            assets={assets}
            rentals={rentals}
            onCreateRental={handleRentalSubmit}
          />
        </Suspense>
      ),
    },
    {
      label: "Calendar",
      value: "calendar",
      content: (
        <Suspense fallback={<div className="p-4 text-onSurfaceVariant">Loading calendar...</div>}>
          <CalendarPage events={calendarEvents} />
        </Suspense>
      ),
    },
  ], [assets, rentals, calendarEvents, summary, locations, users, isAllocationModalOpen, openAllocationModal, closeAllocationModal, handleAllocationSubmit, handleRentalSubmit]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-2">
        <Tabs
          key={defaultTab}
          tabs={tabs}
          defaultValue={defaultTab}
          onValueChange={handleTabChange}
          contentClassName="mt-6"
        />
      </div>
    </AppLayout>
  );
};

export default AllocationMainPage;
