import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from "@/layout/sidebar/AppLayout";
import AssetInformationForm from '../components/AssetInformationForm';
import DisposalTypeSelector from '../components/DisposalTypeSelector';
import NormalDisposalForm from '../components/NormalDisposalForm';
import AgricultureDisposalForm from '../components/AgricultureDisposalForm';
import DisposalHistoryTable from '../components/DisposalHistoryTable';
import DisposalResults from '../components/DisposalResults';
import TabHeader from '@/components/TabHeader';

// Interface definitions based on the disposal process
interface AssetData {
  assetId: string;
  assetDescription: string;
  originalCost: number;
  qualifyingExpenditure: number;
  residualExpenditure: number;
  totalCAClaimed: number;
  purchaseDate: string;
  disposalDate: string;
}

interface DisposalCalculationResults {
  balancingAllowance: number;
  balancingCharge: number;
  totalCAClaimed: number;
  taxTreatment: string;
  clawbackAmount?: number;
  netTaxEffect: number;
  disposedCost: number;
  disposalValue: number;
  remainingCost: number;
  proportion: number;
  disposedQE: number;
  disposedRE: number;
  deemedProceeds: number;
  annualAllowance?: number;
  apportionedAllowance?: number;
}


const DisposalMainPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management - Start with step 1 (Disposal Type)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDisposalType, setSelectedDisposalType] = useState('');
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [disposalConfirmed, setDisposalConfirmed] = useState(false);
  const [isClawbackApplicable, setIsClawbackApplicable] = useState(false);
  const [isSpreadBalancingCharge, setIsSpreadBalancingCharge] = useState(false);

  // Handler for clawback change - auto-untick spread when clawback is unticked
  const handleClawbackChange = (isApplicable: boolean) => {
    setIsClawbackApplicable(isApplicable);
    if (!isApplicable) {
      setIsSpreadBalancingCharge(false);
    }
  };

  // Asset data state
  const [assetData, setAssetData] = useState<AssetData>({
    assetId: 'AS-0001',
    assetDescription: '',
    originalCost: 0,
    qualifyingExpenditure: 0,
    residualExpenditure: 0,
    totalCAClaimed: 0,
    purchaseDate: '',
    disposalDate: '',
  });

  // Multiple assets data for normal disposal  
  // const [multipleAssetsData, setMultipleAssetsData] = useState<unknown[]>([]);
  
  // Disposal type specific data
  const [normalDisposalData, setNormalDisposalData] = useState({
    assetId: 'AS-0001',
    acquireDate: '',
    disposalDate: '',
    disposalValue: 0,
    recipient: '',
    isAssetScrapped: false,
    isControlledDisposal: false,
  });

  const [agricultureDisposalData, setAgricultureDisposalData] = useState({
    assetId: 'AS-0001',
    acquireDate: '',
    disposalDate: '',
    disposalValue: 0,
    recipient: '',
    assetScrapped: false,
    controlledDisposal: false,
    allowanceApportionment: false,
    annualAllowance: 137500,
    apportionedAllowance: 61612,
  });
  
  // Calculation results
  const [calculationResults, setCalculationResults] = useState<DisposalCalculationResults>({
    balancingAllowance: 0,
    balancingCharge: 0,
    totalCAClaimed: 0,
    taxTreatment: '',
    netTaxEffect: 0,
    disposedCost: 0,
    disposalValue: 0,
    remainingCost: 0,
    proportion: 0,
    disposedQE: 0,
    disposedRE: 0,
    deemedProceeds: 0,
  });

  // Disposal history - using the correct interface from DisposalHistoryTable
  const [disposalHistory, setDisposalHistory] = useState<{
    id: string;
    assetId: string;
    disposalType: string;
    disposalDate: string;
    disposalValue: number;
    balancingAllowance: number;
    balancingCharge: number;
    taxTreatment: string;
    notes: string;
    createdAt: string;
    status: 'completed' | 'draft' | 'cancelled';
  }[]>([]);

  // Check for existing disposal data from asset selection
  useEffect(() => {
    try {
      const existingData = localStorage.getItem('disposalAssetData');
      if (existingData) {
        const parsedData = JSON.parse(existingData) as {
          main?: {
            code?: string;
            description?: string;
            purchaseDate?: string;
          };
          allowance?: {
            originalCost?: number;
            qualifyingExpenditure?: number;
            residualExpenditure?: number;
            totalCAClaimed?: number;
          };
        };
        const baseAssetData = {
          assetId: parsedData.main?.code ?? '',
          assetDescription: parsedData.main?.description ?? '',
          originalCost: parsedData.allowance?.originalCost ?? 0,
          qualifyingExpenditure: parsedData.allowance?.qualifyingExpenditure ?? 0,
          residualExpenditure: parsedData.allowance?.residualExpenditure ?? 0,
          totalCAClaimed: parsedData.allowance?.totalCAClaimed ?? 0,
          purchaseDate: parsedData.main?.purchaseDate ?? '',
          disposalDate: '',
        };
        setAssetData(baseAssetData);
        
        // Also populate disposal-type specific forms with basic asset info
        setNormalDisposalData(prev => ({
          ...prev,
          assetId: baseAssetData.assetId,
          acquireDate: baseAssetData.purchaseDate,
        }));
        
        setAgricultureDisposalData(prev => ({
          ...prev,
          assetId: baseAssetData.assetId,
          acquireDate: baseAssetData.purchaseDate,
        }));
        
        localStorage.removeItem('disposalAssetData');
      }
    } catch (error) {
      console.error('Error loading asset data:', error);
    }
  }, []); // Dependencies are intentionally empty - only run once on mount

  // Step navigation handlers
  const handleNextStep = () => {
    const maxStep = 4; // All disposal types now have same number of steps
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  // Asset data handlers
  const handleAssetDataChange = (field: string, value: string | number) => {
    setAssetData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Disposal type handler
  const handleDisposalTypeChange = (disposalType: string) => {
    setSelectedDisposalType(disposalType);
  };

  // Multiple assets handlers
  // const handleMultipleAssetsChange = (data: unknown[]) => {
  //   setMultipleAssetsData(data);
  // };

  // Disposal type specific handlers
  const handleNormalDisposalChange = (field: string, value: string | number | boolean) => {
    setNormalDisposalData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAgricultureDisposalChange = (field: string, value: string | number | boolean) => {
    setAgricultureDisposalData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Hardcoded disposal results
  const calculateDisposalResults = (): DisposalCalculationResults => {
      return {
        balancingAllowance: 0,
        balancingCharge: 0,
        totalCAClaimed: 0,
        taxTreatment: 'Balancing Charge',
        netTaxEffect: 0,
        disposedCost: 0,
        disposalValue: 0,
        remainingCost: 0,
        proportion: 0,
        disposedQE: 0,
        disposedRE: 0,
        deemedProceeds: 0,
      };
  };

  // Final confirmation
  const handleConfirmDisposal = () => {
    setDisposalConfirmed(true);
    // Add to disposal history
    const newHistoryItem = {
      id: Date.now().toString(),
      assetId: assetData.assetId,
      disposalType: selectedDisposalType,
      disposalDate: assetData.disposalDate,
      disposalValue: calculationResults.disposalValue,
      balancingAllowance: calculationResults.balancingAllowance,
      balancingCharge: calculationResults.balancingCharge,
      taxTreatment: calculationResults.taxTreatment,
      notes: '',
      createdAt: new Date().toISOString(),
      status: 'completed' as const,
    };
    setDisposalHistory(prev => [newHistoryItem, ...prev]);
  };



  // Render current step content
  const renderStepContent = () => {
    // Show disposal history if requested
    if (isViewingHistory) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-onBackground">Disposal History</h2>
          <DisposalHistoryTable
            entries={disposalHistory}
            onView={(item) => { console.log('View details:', item); }}
            onEdit={(item) => { console.log('Edit:', item); }}
            onDelete={(id) => {
              setDisposalHistory(prev => prev.filter(h => h.id !== id));
            }}
          />
        </div>
      );
    }


    // Regular step content (corrected order)
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <DisposalTypeSelector
              selectedDisposalType={selectedDisposalType}
              onDisposalTypeChange={handleDisposalTypeChange}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
              disabled={false}
              showPrevious={false}
            />
          </div>
        );

      case 2:
        // Render disposal-type specific asset information forms
        if (selectedDisposalType === 'partial') {
          return (
            <NormalDisposalForm
              data={normalDisposalData}
              onChange={handleNormalDisposalChange}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          );
        } else if (selectedDisposalType === 'agriculture') {
          return (
            <AgricultureDisposalForm
              data={agricultureDisposalData}
              onChange={handleAgricultureDisposalChange}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          );
        } else {
          // For other disposal types, use the general asset information form
          return (
            <AssetInformationForm
              data={assetData}
              onChange={handleAssetDataChange}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
              readOnly={false}
            />
          );
        }

      case 3: {
        const results = calculateDisposalResults();
        
        return (
          <DisposalResults
            assetData={assetData}
            disposalType={selectedDisposalType}
            calculationResults={results}
            isClawbackApplicable={isClawbackApplicable}
            onClawbackChange={handleClawbackChange}
            isSpreadBalancingCharge={isSpreadBalancingCharge}
            onSpreadBalancingChargeChange={setIsSpreadBalancingCharge}
            onConfirm={() => {
              if (!disposalConfirmed) {
                setCalculationResults(results);
                handleConfirmDisposal();
              }
            }}
            onPrevious={handlePreviousStep}
            isConfirmed={disposalConfirmed}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Tax Computation" },
        { label: "Asset Disposal" },
      ]}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-surface border-b border-outlineVariant px-6 py-4">
          <TabHeader title="Asset Disposal" 
            subtitle="Manage asset disposal processes and calculations"
            actions={isViewingHistory ? [
              {
                label: "New Disposal",
                onAction: () => { void navigate('/asset'); },
                variant: "outline",
                size: "default",
              },
              {
                label: "Back to Disposal Process",
                onAction: () => { setIsViewingHistory(false); },
                variant: "outline",
                size: "default",
              },
            ] : [
              {
                label: "View History",
                onAction: () => { setIsViewingHistory(true); },
                variant: "outline",
                size: "default",
              },
            ]}
            />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DisposalMainPage;
