import React, { useMemo } from "react";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import { Badge, Button, Card } from "@/components/ui/components";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/components/Table";
import { FilterBar } from "@/features/coverage/components/FilterBar";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type {
  CoverageWarranty,
  WarrantyFilters,
  WarrantySummaryMetrics,
} from "@/features/coverage/types";
import { formatDate } from "@/features/coverage/utils/formatters";

interface WarrantiesTabProps {
  warranties: CoverageWarranty[];
  summary: WarrantySummaryMetrics;
  providers: string[];
  filters: WarrantyFilters;
  onFiltersChange: (filters: Partial<WarrantyFilters>) => void;
  onAddWarranty: () => void;
}

export const WarrantiesTab: React.FC<WarrantiesTabProps> = ({
  warranties,
  summary,
  providers,
  filters,
  onFiltersChange,
  onAddWarranty,
}) => {
  const summaryCards: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Active Warranties",
        value: summary.activeWarranties,
        description: "Currently in coverage",
        tone: summary.activeWarranties > 0 ? "success" : "default",
      },
      {
        label: "Assets Covered",
        value: summary.assetsCovered,
        description: "Equipment protected",
      },
      {
        label: "Assets Not Covered",
        value: summary.assetsNotCovered,
        tone: summary.assetsNotCovered > 0 ? "warning" : "success",
      },
      {
        label: "Expiring Soon (30d)",
        value: summary.expiringSoon,
        tone: summary.expiringSoon > 0 ? "warning" : "success",
      },
      {
        label: "Expired Warranties",
        value: summary.expired,
        tone: summary.expired > 0 ? "danger" : "success",
      },
    ],
    [summary]
  );

  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch = filters.search
        ? [
            warranty.name,
            warranty.provider,
            warranty.warrantyNumber,
            warranty.coverage,
            ...warranty.assetsCovered.map((asset) => `${asset.id} ${asset.name}`),
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;
      const matchesStatus = filters.status ? warranty.status === filters.status : true;
      const matchesProvider = filters.provider ? warranty.provider === filters.provider : true;
      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [warranties, filters]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="title-large font-semibold text-onSurface">Warranty</h2>
          <p className="body-medium text-onSurfaceVariant">
            Track manufacturer warranty coverage and renewal windows
          </p>
        </div>
        <Button variant="default" onClick={onAddWarranty}>
          Add Warranty
        </Button>
      </div>

      <SummaryCards data={summaryCards} columns={4} />

      <FilterBar
        searchLabel="Search"
        searchPlaceholder="Warranty name, provider, or asset"
        searchValue={filters.search}
        onSearchChange={(value) => onFiltersChange({ search: value })}
        dropdowns={[
          {
            id: "status",
            label: "Status",
            value: filters.status,
            placeholder: "All Status",
            options: [
              { label: "All Status", value: "" },
              { label: "Active", value: "Active" },
              { label: "Expiring Soon", value: "Expiring Soon" },
              { label: "Expired", value: "Expired" },
            ],
            onSelect: (value) =>
              onFiltersChange({ status: value as WarrantyFilters["status"] }),
          },
          {
            id: "provider",
            label: "Provider",
            value: filters.provider,
            placeholder: "All Providers",
            options: [
              { label: "All Providers", value: "" },
              ...providers.map((provider) => ({ label: provider, value: provider })),
            ],
            onSelect: (value) => onFiltersChange({ provider: value }),
          },
        ]}
        onClear={() =>
          onFiltersChange({
            search: "",
            status: "",
            provider: "",
          })
        }
      />

      <Card className="mt-0 p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Warranty</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Coverage</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarranties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-onSurfaceVariant py-10">
                  No warranties match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredWarranties.map((warranty) => (
                <TableRow key={warranty.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-onSurface">{warranty.name}</span>
                      <span className="body-small text-onSurfaceVariant">
                        {warranty.warrantyNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{warranty.provider}</TableCell>
                  <TableCell>{warranty.coverage}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(warranty.expiryDate)}</span>
                      <span className="body-small text-onSurfaceVariant">
                        {warranty.status === "Expiring Soon" && "Renew within 30 days"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={warranty.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {warranty.assetsCovered.map((asset) => (
                        <Badge
                          key={asset.id}
                          text={asset.name}
                          variant="grey"
                          className="h-7 px-3 py-1"
                        />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
