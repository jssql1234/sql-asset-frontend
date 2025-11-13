import React, { useMemo } from "react";
import { DataTableExtended } from '@/components/DataTableExtended/DataTableExtended';
import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { FinancialYearGroup } from "../services/hpPaymentService";
import { Input } from "@/components/ui/components/Input";


interface HPPaymentScheduleTableProps {
  financialYearGroups: FinancialYearGroup[];
  totals: {
    totalInstalments: number;
    totalPrincipal: number;
    totalInterest: number;
    totalInstalmentAmount: number;
    totalPaymentMade: number;
  } | null;
  depositAmount: number;
  expandedYears: Set<number>;
  onToggleYearExpansion: (ya: number) => void;
  isEditMode: boolean;
  updatePaymentSchedule: (ya: number, month: number, newAmount: number) => void;
}

type TableRowData = {
  id: string;
  type: "group" | "detail" | "total" | "deposit" | "totalPayment";
  ya?: number;
  month?: number;
  monthName?: string;
  numberOfInstalments?: number;
  principalAmount: number;
  interestAmount: number;
  totalInstalmentAmount: number;
  outstandingPrincipal: number | string;
};

export const HPPaymentScheduleTable: React.FC<HPPaymentScheduleTableProps> = ({
  financialYearGroups,
  totals,
  depositAmount,
  expandedYears,
  onToggleYearExpansion,
  isEditMode,
  updatePaymentSchedule,
}) => {
  // Transform data for DataTableExtended
  const tableData = useMemo(() => {
    const rows: TableRowData[] = [];
    
    financialYearGroups.forEach((yearGroup) => {
      const totalPrincipal = yearGroup.months.reduce((sum, month) => sum + month.principalAmount, 0);
      const totalInterest = yearGroup.months.reduce((sum, month) => sum + month.interestAmount, 0);
      const totalInstalment = yearGroup.months.reduce((sum, month) => sum + month.totalInstalmentAmount, 0);
      const closingBalance = yearGroup.months[yearGroup.months.length - 1]?.outstandingPrincipal || 0;

      // Add group row
      rows.push({
        id: `group-${yearGroup.ya}`,
        type: "group",
        ya: yearGroup.ya,
        numberOfInstalments: yearGroup.months.length,
        principalAmount: totalPrincipal,
        interestAmount: totalInterest,
        totalInstalmentAmount: totalInstalment,
        outstandingPrincipal: closingBalance,
      });

      // Add detail rows if expanded
      if (expandedYears.has(yearGroup.ya)) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        yearGroup.months.forEach((month) => {
          rows.push({
            id: `detail-${yearGroup.ya}-${month.month}`,
            type: "detail",
            ya: yearGroup.ya,
            month: month.month,
            monthName: monthNames[month.month - 1],
            principalAmount: month.principalAmount,
            interestAmount: month.interestAmount,
            totalInstalmentAmount: month.totalInstalmentAmount,
            outstandingPrincipal: month.outstandingPrincipal,
          });
        });
      }
    });

    // Add footer rows as part of the data
    if (totals) {
      rows.push({
        id: "footer-total",
        type: "total",
        principalAmount: totals.totalPrincipal,
        interestAmount: totals.totalInterest,
        totalInstalmentAmount: totals.totalInstalmentAmount,
        outstandingPrincipal: "-",
        numberOfInstalments: totals.totalInstalments,
      });

      rows.push({
        id: "footer-deposit",
        type: "deposit",
        principalAmount: 0,
        interestAmount: 0,
        totalInstalmentAmount: depositAmount,
        outstandingPrincipal: "-",
      });

      rows.push({
        id: "footer-totalPayment",
        type: "totalPayment",
        principalAmount: 0,
        interestAmount: 0,
        totalInstalmentAmount: totals.totalPaymentMade,
        outstandingPrincipal: "-",
      });
    }

    return rows;
  }, [financialYearGroups, expandedYears, totals, depositAmount]);

  const columns: ColumnDef<TableRowData>[] = useMemo(() => [
    {
      id: "ya",
      header: "YA",
      cell: ({ row }) => {
        const rowType = row.original.type;
        
        if (rowType === "group") {
          const isExpanded = row.original.ya !== undefined && expandedYears.has(row.original.ya);
          return (
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => row.original.ya && onToggleYearExpansion(row.original.ya)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              YA {row.original.ya}
            </div>
          );
        } else if (rowType === "detail") {
          return (
            <div className="pl-12">
              {row.original.monthName} {row.original.ya} (Month {row.original.month})
            </div>
          );
        } else if (rowType === "total") {
          return "Total";
        } else if (rowType === "deposit") {
          return "Deposit";
        } else if (rowType === "totalPayment") {
          return "Total Payment Made (Instalments + Deposit)";
        }
        return null;
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "numberOfInstalments",
      header: "No. of Instalments",
      cell: ({ row }) => {
        const rowType = row.original.type;
        if (rowType === "group" || rowType === "total") {
          return row.original.numberOfInstalments ?? "";
        }
        return "";
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "principalAmount",
      header: "Principal Amount",
      cell: ({ row }) => {
        const rowType = row.original.type;
        if (rowType === "deposit" || rowType === "totalPayment") {
          return "";
        }
        if (typeof row.original.principalAmount === "number") {
          return `RM ${row.original.principalAmount.toFixed(2)}`;
        }
        return "";
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "interestAmount",
      header: "Interest Amount",
      cell: ({ row }) => {
        const rowType = row.original.type;
        if (rowType === "deposit" || rowType === "totalPayment") {
          return "";
        }
        if (typeof row.original.interestAmount === "number") {
          return `RM ${row.original.interestAmount.toFixed(2)}`;
        }
        return "";
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "totalInstalmentAmount",
      header: "Total Instalment Amount",
      cell: ({ row }) => {        
        const { type, totalInstalmentAmount, ya, month } = row.original;

        if (type === "detail" && isEditMode) {
          return (
            <Input
              key={`input-${ya}-${month}-${isEditMode}`}
              type="number"
              className="w-24"
              defaultValue={totalInstalmentAmount.toFixed(2)}
              onBlur={(e) => {
                const newAmount = parseFloat(e.target.value);
                if (!isNaN(newAmount) && newAmount >= 0) {
                  updatePaymentSchedule(row.original.ya as number, row.original.month as number, newAmount);
                }
              }}
            />
          );
        } else if (typeof totalInstalmentAmount === "number") {
          return `RM ${totalInstalmentAmount.toFixed(2)}`;
        }
        return "";
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "outstandingPrincipal",
      header: "Outstanding Principal",
      cell: ({ row }) => {
        if (row.original.type === "total" || row.original.type === "deposit" || row.original.type === "totalPayment") {
          return "-";
        }
        if (typeof row.original.outstandingPrincipal === "number") {
          return `RM ${row.original.outstandingPrincipal.toFixed(2)}`;
        }
        return row.original.outstandingPrincipal;
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [expandedYears, onToggleYearExpansion, isEditMode, updatePaymentSchedule]);
  
  return (
    <DataTableExtended
      columns={columns}
      key={`hp-payment-schedule-table-${isEditMode}`}
      data={tableData}
      showPagination={false}
    />
  );
};
