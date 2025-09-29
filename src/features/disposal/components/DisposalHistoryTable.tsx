import React from 'react';
import { Button } from '@/components/ui/components';

interface DisposalHistoryEntry {
  id: string;
  assetCode: string;
  disposalType: string;
  disposalDate: string;
  disposalValue: number;
  balancingAllowance: number;
  balancingCharge: number;
  taxTreatment: string;
  notes: string;
  isMultipleAssets?: boolean;
  multipleAssets?: Array<{
    assetId: string;
    disposalValue: number;
    balancingAllowance: number;
    balancingCharge: number;
  }>;
  createdAt: string;
  status: 'completed' | 'draft' | 'cancelled';
}

interface DisposalHistoryTableProps {
  entries: DisposalHistoryEntry[];
  onView: (entry: DisposalHistoryEntry) => void;
  onEdit: (entry: DisposalHistoryEntry) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const DisposalHistoryTable: React.FC<DisposalHistoryTableProps> = ({
  entries,
  onView,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = "No disposal history found.",
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDisposalTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      'partial': 'Partial Disposal',
      'mfrs5': 'MFRS 5 Held-for-Sale',
      'gift': 'Gift to Approved Institutions',
      'agriculture': 'Agriculture Disposal',
      'normal': 'Normal Disposal',
      'controlled': 'Controlled Disposal',
      'written-off': 'Written Off',
    };
    return typeLabels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { bg: 'bg-greenContainer', text: 'text-green', label: 'Completed' },
      draft: { bg: 'bg-yellowContainer', text: 'text-yellow', label: 'Draft' },
      cancelled: { bg: 'bg-errorContainer', text: 'text-error', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTaxTreatmentBadge = (treatment: string) => {
    if (!treatment) return null;

    const isCharge = treatment.toLowerCase().includes('charge');
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isCharge ? 'bg-errorContainer text-error' : 'bg-primaryContainer text-primary'
      }`}>
        {treatment}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="border border-outlineVariant rounded-md">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-onSurface">Loading disposal history...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="border border-outlineVariant rounded-md">
        <div className="p-8 text-center">
          <div className="text-outline mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-onSurface">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-outlineVariant rounded-md">
        <table className="w-full">
          <thead className="bg-surfaceContainer">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Asset ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Disposal Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Disposal Value
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                BA/BC
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Tax Treatment
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-outlineVariant hover:bg-surfaceContainer/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-onSurface">{entry.assetCode}</div>
                  {entry.isMultipleAssets && (
                    <div className="text-xs text-outline">
                      +{entry.multipleAssets?.length || 0} assets
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-onSurface">{getDisposalTypeLabel(entry.disposalType)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-onSurface">{formatDate(entry.disposalDate)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-onSurface">
                    {formatCurrency(entry.disposalValue)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {entry.balancingAllowance > 0 && (
                      <div className="text-xs text-blue-600">
                        BA: {formatCurrency(entry.balancingAllowance)}
                      </div>
                    )}
                    {entry.balancingCharge > 0 && (
                      <div className="text-xs text-red-600">
                        BC: {formatCurrency(entry.balancingCharge)}
                      </div>
                    )}
                    {entry.balancingAllowance === 0 && entry.balancingCharge === 0 && (
                      <div className="text-xs text-outline">-</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getTaxTreatmentBadge(entry.taxTreatment)}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(entry.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(entry)}
                      className="text-xs"
                    >
                      View
                    </Button>
                    {entry.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(entry)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(entry.id)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-surfaceContainer p-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-onSurface">Total Records: </span>
            <span className="font-semibold">{entries.length}</span>
          </div>
          <div>
            <span className="text-onSurface">Total Disposal Value: </span>
            <span className="font-semibold">
              {formatCurrency(entries.reduce((sum, entry) => sum + entry.disposalValue, 0))}
            </span>
          </div>
          <div>
            <span className="text-onSurface">Total BA: </span>
            <span className="font-semibold text-blue-600">
              {formatCurrency(entries.reduce((sum, entry) => sum + entry.balancingAllowance, 0))}
            </span>
          </div>
          <div>
            <span className="text-onSurface">Total BC: </span>
            <span className="font-semibold text-red-600">
              {formatCurrency(entries.reduce((sum, entry) => sum + entry.balancingCharge, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisposalHistoryTable;
