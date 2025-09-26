import { useMemo, useState } from "react";
import { Button, Card, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, FilterChip,} from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import CalendarView from "./CalendarView";

const ASSET_CATEGORIES = [
  { value: "", label: "All Assets" },
  { value: "laptops", label: "Laptops" },
  { value: "projectors", label: "Projectors" },
  { value: "vehicles", label: "Vehicles" },
  { value: "equipment", label: "Equipment" },
];

const VIEW_OPTIONS = [
  { value: "month", label: "Month View" },
  { value: "week", label: "Week View" },
  { value: "day", label: "Day View" },
];

const CalendarTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assetFilter, setAssetFilter] = useState("");
  const [viewMode, setViewMode] = useState("month");

  const activeViewLabel = useMemo(
    () => VIEW_OPTIONS.find((option) => option.value === viewMode)?.label ?? "Month View",
    [viewMode]
  );

  const activeFilters = useMemo(
    () =>
      [
        assetFilter && {
          key: "asset" as const,
          label: `Asset: ${
            ASSET_CATEGORIES.find((option) => option.value === assetFilter)?.label ?? ""
          }`,
        },
      ].filter(Boolean) as { key: "asset"; label: string }[],
    [assetFilter]
  );

  return (
    <div className="space-y-6">
      <Card className="border border-outline bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="title-large text-onSurface">Asset Calendar</h2>
            <p className="body-medium text-onSurfaceVariant mt-1">
              View asset assignments, reservations, and maintenance windows on a timeline.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex gap-3">
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-52"
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  label={
                    ASSET_CATEGORIES.find((option) => option.value === assetFilter)?.label ??
                    "All Assets"
                  }
                  className="w-48 justify-between"
                />
                <DropdownMenuContent matchTriggerWidth disablePortal>
                  <DropdownMenuRadioGroup
                    value={assetFilter}
                    onValueChange={(value) => setAssetFilter(value)}
                  >
                    {ASSET_CATEGORIES.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger label={activeViewLabel} className="w-44 justify-between" />
              <DropdownMenuContent matchTriggerWidth disablePortal>
                <DropdownMenuRadioGroup
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value)}
                >
                  {VIEW_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="body-small text-onSurfaceVariant">Active:</span>
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.key}
                selected
                className="px-3 py-1"
                onChange={(checked) => {
                  if (!checked) {
                    setAssetFilter("");
                  }
                }}
              >
                {filter.label}
              </FilterChip>
            ))}
            <Button variant="link" size="sm" onClick={() => setAssetFilter("")}>
              Reset asset filter
            </Button>
          </div>
        )}
      </Card>

      {/* Calendar Legend */}
      <div className="bg-surfaceContainer border border-outline rounded-lg p-4">
        <h3 className="title-small text-onSurface mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="label-medium text-onSurfaceVariant">
              User Assignments
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded"></div>
            <span className="label-medium text-onSurfaceVariant">
              Location Allocations
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-error rounded"></div>
            <span className="label-medium text-onSurfaceVariant">
              Overdue Returns
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success rounded"></div>
            <span className="label-medium text-onSurfaceVariant">
              Maintenance Schedules
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="bg-surface border border-outline rounded-lg">
        <CalendarView
          viewMode={viewMode}
          searchTerm={searchTerm}
          assetFilter={assetFilter}
        />
      </div>
    </div>
  );
};

export default CalendarTab;
