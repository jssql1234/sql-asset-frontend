import React, { useState, useEffect } from 'react';
import { AssetLayout } from '@/layout/AssetSidebar';
import DisposalStepWizard from '../components/DisposalStepWizard';
import AssetInformationForm from '../components/AssetInformationForm';
import DisposalTypeSelector from '../components/DisposalTypeSelector';
import NormalDisposalForm from '../components/NormalDisposalForm';
import MFRS5DisposalForm from '../components/MFRS5DisposalForm';
import GiftDisposalForm from '../components/GiftDisposalForm';
import AgricultureDisposalForm from '../components/AgricultureDisposalForm';
import DisposalHistoryTable from '../components/DisposalHistoryTable';
import DisposalResults from '../components/DisposalResults';
import { Button } from '@/components/ui/components';

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
}

interface WizardStep {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  current: boolean;
  disabled?: boolean;
}

const DisposalMainPage: React.FC = () => {
  // State management - Start with step 1 (Disposal Type)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDisposalType, setSelectedDisposalType] = useState('');
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [disposalConfirmed, setDisposalConfirmed] = useState(false);
  const [isClawbackApplicable, setIsClawbackApplicable] = useState(false);

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

  // Multiple assets data for MFRS5 and partial disposal  
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

  const [mfrs5DisposalData, setMfrs5DisposalData] = useState({
    assetId: 'AS-0001',
    classificationDate: '',
    disposalValue: 0,
    recipient: '',
  });

  const [giftDisposalData, setGiftDisposalData] = useState({
    assetId: 'AS-0001',
    acquireDate: '',
    disposalDate: '',
    recipient: '',
  });

  const [agricultureDisposalData, setAgricultureDisposalData] = useState({
    assetId: 'AS-0001',
    acquireDate: '',
    disposalDate: '',
    disposalValue: 0,
    recipient: '',
    assetScrapped: false,
    controlledDisposal: false,
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
  const [disposalHistory, setDisposalHistory] = useState<Array<{
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
  }>>([]);

  // Check for existing disposal data from asset selection
  useEffect(() => {
    try {
      const existingData = localStorage.getItem('disposalAssetData');
      if (existingData) {
        const parsedData = JSON.parse(existingData);
        const baseAssetData = {
          assetId: parsedData.main?.code || '',
          assetDescription: parsedData.main?.description || '',
          originalCost: parsedData.allowance?.originalCost || 0,
          qualifyingExpenditure: parsedData.allowance?.qualifyingExpenditure || 0,
          residualExpenditure: parsedData.allowance?.residualExpenditure || 0,
          totalCAClaimed: parsedData.allowance?.totalCAClaimed || 0,
          purchaseDate: parsedData.main?.purchaseDate || '',
          disposalDate: '',
        };
        setAssetData(baseAssetData);
        
        // Also populate disposal-type specific forms with basic asset info
        setNormalDisposalData(prev => ({
          ...prev,
          assetId: baseAssetData.assetId,
          acquireDate: baseAssetData.purchaseDate,
        }));

        setMfrs5DisposalData(prev => ({
          ...prev,
          assetId: baseAssetData.assetId,
        }));

        setGiftDisposalData(prev => ({
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

  // Define wizard steps based on the disposal process (correct order)
  const getWizardSteps = (): WizardStep[] => {
    const baseSteps = [
      {
        id: 'disposal-type',
        label: 'Disposal Type',
        description: 'Select disposal type',
        completed: currentStep > 1,
        current: currentStep === 1,
        disabled: false,
      },
      {
        id: 'asset-info',
        label: 'Asset Information',
        description: 'Enter asset details',
        completed: currentStep > 2,
        current: currentStep === 2,
        disabled: currentStep < 2,
      },
      {
        id: 'results',
        label: 'Final Results',
        description: 'Confirm disposal',
        completed: disposalConfirmed,
        current: currentStep === 3 && !disposalConfirmed,
        disabled: currentStep < 3,
      }
    ];
    
    return baseSteps;
  };

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

  const handleStepClick = (stepId: string) => {
    // All disposal types now have same step structure
    const stepMap = {
      'disposal-type': 1,
      'asset-info': 2,
      'results': 3,
    };
    
    const targetStep = stepMap[stepId as keyof typeof stepMap];
    if (targetStep && targetStep <= currentStep + 1) {
      setCurrentStep(targetStep);
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

  const handleMfrs5DisposalChange = (field: string, value: string | number) => {
    setMfrs5DisposalData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGiftDisposalChange = (field: string, value: string) => {
    setGiftDisposalData(prev => ({
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
  const calculateDisposalResults = (disposalType: string, assetData: AssetData): DisposalCalculationResults => {
    if (disposalType === 'gift') {
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
    } else if (disposalType === 'agriculture') {
      return {
        balancingAllowance: 0,
        balancingCharge: 0,
        totalCAClaimed: agricultureDisposalData.disposalValue,
        taxTreatment: 'Balancing Allowance',
        netTaxEffect: 0,
        disposedCost: 0,
        disposalValue: 0,
        remainingCost: 0,
        proportion: 0,
        disposedQE: 0,
        disposedRE: 0,
        deemedProceeds: 0,
      };
    } else {
      // Normal disposal calculations
      const originalCost = assetData.originalCost;
      const totalCAClaimed = assetData.totalCAClaimed;
      const wdv = originalCost - totalCAClaimed;
      const disposalValue = originalCost * 0.85; // Simulated disposal value
      
      if (disposalValue > wdv) {
        // Balancing charge
        const balancingCharge = disposalValue - wdv;
        return {
          balancingAllowance: 0,
          balancingCharge: balancingCharge,
          totalCAClaimed: wdv,
          taxTreatment: 'Balancing Charge',
          netTaxEffect: -balancingCharge,
          disposedCost: 0,
          disposalValue: 0,
          remainingCost: 0,
          proportion: 0,
          disposedQE: 0,
          disposedRE: 0,
          deemedProceeds: 0,
        };
      } else {
        // Balancing allowance
        const balancingAllowance = wdv - disposalValue;
        return {
          balancingAllowance: balancingAllowance,
          balancingCharge: 0,
          totalCAClaimed: wdv,
          taxTreatment: 'Balancing Allowance',
          netTaxEffect: balancingAllowance,
          disposedCost: 0,
          disposalValue: 0,
          remainingCost: 0,
          proportion: 0,
          disposedQE: 0,
          disposedRE: 0,
          deemedProceeds: 0,
        };
      }
    }
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-onBackground">Disposal History</h2>
            <Button
              variant="outline"
              onClick={() => setIsViewingHistory(false)}
            >
              Back to Disposal Process
            </Button>
          </div>
          <DisposalHistoryTable
            entries={disposalHistory}
            onView={(item) => console.log('View details:', item)}
            onEdit={(item) => console.log('Edit:', item)}
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
        } else if (selectedDisposalType === 'mfrs5') {
          return (
            <MFRS5DisposalForm
              data={mfrs5DisposalData}
              onChange={handleMfrs5DisposalChange}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          );
        } else if (selectedDisposalType === 'gift') {
          return (
            <GiftDisposalForm
              data={giftDisposalData}
              onChange={handleGiftDisposalChange}
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
        const results = calculateDisposalResults(selectedDisposalType, assetData);
        
        return (
          <DisposalResults
            assetData={assetData}
            disposalType={selectedDisposalType}
            calculationResults={results}
            isClawbackApplicable={isClawbackApplicable}
            onClawbackChange={setIsClawbackApplicable}
            onConfirm={() => {
              if (!disposalConfirmed) {
                setCalculationResults(results);
                handleConfirmDisposal();
              }
            }}
            onPrevious={handlePreviousStep}
            isConfirmed={disposalConfirmed}
            readOnly={false}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <AssetLayout activeSidebarItem="disposal">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-surface border-b border-outlineVariant px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-onBackground">Asset Disposal</h1>
              <p className="text-onSurface">Manage asset disposal processes and calculations</p>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsViewingHistory(!isViewingHistory)}
              >
                {isViewingHistory ? 'New Disposal' : 'View History'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar with Wizard */}
          {!isViewingHistory && (
            <div className="w-80 bg-surfaceContainer border-r border-outlineVariant p-6 overflow-y-auto">
              <DisposalStepWizard
                steps={getWizardSteps()}
                onStepClick={handleStepClick}
                showProgressBar={true}
                allowStepNavigation={!disposalConfirmed}
              />
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </AssetLayout>
  );
};

export default DisposalMainPage;
