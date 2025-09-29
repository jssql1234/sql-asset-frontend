import React from 'react';
import Card from '@/components/ui/components/Card';

interface CalculationStep {
  step: number;
  description: string;
  calculation: string;
  result: number;
  notes?: string;
}

interface CalculationResultsData {
  assetId: string;
  disposalValue: number;
  writtenDownValue: number;
  balancingAllowance: number;
  balancingCharge: number;
  taxTreatment: string;
  clawbackAmount?: number;
  steps: CalculationStep[];
  summary: {
    totalBA: number;
    totalBC: number;
    netEffect: number;
    taxImplication: string;
  };
}

interface CalculationResultsTableProps {
  results: CalculationResultsData[];
  disposalType: string;
  showWorkingSteps?: boolean;
  showClawbackDetails?: boolean;
}

const CalculationResultsTable: React.FC<CalculationResultsTableProps> = ({
  results,
  showWorkingSteps = true,
  showClawbackDetails = false,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTaxTreatmentBadge = (treatment: string) => {
    const isCharge = treatment.toLowerCase().includes('charge');
    const isAllowance = treatment.toLowerCase().includes('allowance');
    
    if (isCharge) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-errorContainer text-error">
          {treatment}
        </span>
      );
    } else if (isAllowance) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primaryContainer text-primary">
          {treatment}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-surfaceContainer text-onSurface">
          {treatment}
        </span>
      );
    }
  };

  const renderSummaryTable = () => (
    <Card className="mb-6">
      <div className="border-b border-outlineVariant pb-4 mb-4">
        <h3 className="text-lg font-semibold text-onSurface">Calculation Summary</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surfaceContainer">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Asset ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Disposal Value
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                WDV
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                BA
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                BC
              </th>
              {showClawbackDetails && (
                <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                  Clawback
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-onSurface border-b border-outlineVariant">
                Tax Treatment
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="border-b border-outlineVariant hover:bg-surfaceContainer/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-onSurface">{result.assetId}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-onSurface">{formatCurrency(result.disposalValue)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-onSurface">{formatCurrency(result.writtenDownValue)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className={`text-sm font-medium ${result.balancingAllowance > 0 ? 'text-blue-600' : 'text-outline'}`}>
                    {result.balancingAllowance > 0 ? formatCurrency(result.balancingAllowance) : '-'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={`text-sm font-medium ${result.balancingCharge > 0 ? 'text-red-600' : 'text-outline'}`}>
                    {result.balancingCharge > 0 ? formatCurrency(result.balancingCharge) : '-'}
                  </div>
                </td>
                {showClawbackDetails && (
                  <td className="px-4 py-3">
                    <div className={`text-sm font-medium ${result.clawbackAmount && result.clawbackAmount > 0 ? 'text-red-600' : 'text-outline'}`}>
                      {result.clawbackAmount && result.clawbackAmount > 0 ? formatCurrency(result.clawbackAmount) : '-'}
                    </div>
                  </td>
                )}
                <td className="px-4 py-3">
                  {getTaxTreatmentBadge(result.taxTreatment)}
                </td>
              </tr>
            ))}
            
            {/* Totals Row */}
            {results.length > 1 && (
              <tr className="bg-surfaceContainer border-t-2 border-primary font-semibold">
                <td className="px-4 py-3 text-sm text-onSurface">TOTAL</td>
                <td className="px-4 py-3 text-sm text-primary">
                  {formatCurrency(results.reduce((sum, r) => sum + r.disposalValue, 0))}
                </td>
                <td className="px-4 py-3 text-sm text-onSurface">
                  {formatCurrency(results.reduce((sum, r) => sum + r.writtenDownValue, 0))}
                </td>
                <td className="px-4 py-3 text-sm text-blue-600">
                  {formatCurrency(results.reduce((sum, r) => sum + r.balancingAllowance, 0))}
                </td>
                <td className="px-4 py-3 text-sm text-red-600">
                  {formatCurrency(results.reduce((sum, r) => sum + r.balancingCharge, 0))}
                </td>
                {showClawbackDetails && (
                  <td className="px-4 py-3 text-sm text-red-600">
                    {formatCurrency(results.reduce((sum, r) => sum + (r.clawbackAmount || 0), 0))}
                  </td>
                )}
                <td className="px-4 py-3"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderWorkingSteps = (result: CalculationResultsData) => (
    <Card className="mb-4">
      <div className="border-b border-outlineVariant pb-4 mb-4">
        <h4 className="text-md font-semibold text-onSurface">
          Working Steps - {result.assetId}
        </h4>
      </div>

      <div className="space-y-4">
        {result.steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4 p-3 bg-surfaceContainer rounded-md">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary text-onPrimary rounded-full flex items-center justify-center text-sm font-semibold">
                {step.step}
              </div>
            </div>
            <div className="flex-grow">
              <div className="text-sm font-medium text-onSurface mb-1">{step.description}</div>
              <div className="text-sm text-outline mb-2 font-mono bg-surfaceContainerHighest p-2 rounded">
                {step.calculation}
              </div>
              <div className="text-sm font-semibold text-primary">
                Result: {formatCurrency(step.result)}
              </div>
              {step.notes && (
                <div className="text-xs text-outline mt-1 italic">{step.notes}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderOverallSummary = () => {
    const totalSummary = results.reduce(
      (acc, result) => ({
        totalBA: acc.totalBA + result.summary.totalBA,
        totalBC: acc.totalBC + result.summary.totalBC,
        netEffect: acc.netEffect + result.summary.netEffect,
      }),
      { totalBA: 0, totalBC: 0, netEffect: 0 }
    );

    return (
      <Card className="mt-6">
        <div className="border-b border-outlineVariant pb-4 mb-4">
          <h3 className="text-lg font-semibold text-onSurface">Overall Summary</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primaryContainer border border-primary rounded-md p-4">
            <div className="text-sm text-primary mb-1">Total Balancing Allowance</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalSummary.totalBA)}</div>
          </div>
          
          <div className="bg-errorContainer border border-error rounded-md p-4">
            <div className="text-sm text-error mb-1">Total Balancing Charge</div>
            <div className="text-2xl font-bold text-error">{formatCurrency(totalSummary.totalBC)}</div>
          </div>
          
          <div className={`border rounded-md p-4 ${
            totalSummary.netEffect >= 0 ? 'bg-greenContainer border-green' : 'bg-errorContainer border-error'
          }`}>
            <div className={`text-sm mb-1 ${
              totalSummary.netEffect >= 0 ? 'text-green' : 'text-error'
            }`}>
              Net Tax Effect
            </div>
            <div className={`text-2xl font-bold ${
              totalSummary.netEffect >= 0 ? 'text-green-800' : 'text-red-800'
            }`}>
              {formatCurrency(Math.abs(totalSummary.netEffect))}
              <span className="text-sm ml-1">
                {totalSummary.netEffect >= 0 ? '(Allowance)' : '(Charge)'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 p-4 bg-surfaceContainer rounded-md">
          <h4 className="font-medium text-onSurface mb-2">Tax Implications</h4>
          <ul className="text-sm text-onSurface space-y-1">
            <li>• Balancing allowances reduce taxable income</li>
            <li>• Balancing charges increase taxable income</li>
            {showClawbackDetails && (
              <li>• Clawback provisions apply to assets disposed within 2 years of acquisition</li>
            )}
            <li>• Ensure proper documentation is maintained for tax compliance</li>
          </ul>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderSummaryTable()}
      
      {showWorkingSteps && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-onSurface">Working Steps</h3>
          {results.map((result) => renderWorkingSteps(result))}
        </div>
      )}
      
      {renderOverallSummary()}
    </div>
  );
};

export default CalculationResultsTable;
