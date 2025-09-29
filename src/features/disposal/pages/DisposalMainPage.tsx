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
import { Button } from '@/components/ui/components';
import Card from '@/components/ui/components/Card';

// Interface definitions based on the disposal process
interface AssetData {
  assetCode: string;
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
  writtenDownValue: number;
  taxTreatment: string;
  clawbackAmount?: number;
  netTaxEffect: number;
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

  // Asset data state
  const [assetData, setAssetData] = useState<AssetData>({
    assetCode: '',
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
    assetId: '',
    acquireDate: '',
    disposalDate: '',
    disposalValue: 0,
    recipient: '',
    isAssetScrapped: false,
    isControlledDisposal: false,
  });

  const [mfrs5DisposalData, setMfrs5DisposalData] = useState({
    assetId: '',
    classificationDate: '',
    disposalValue: 0,
    recipient: '',
  });

  const [giftDisposalData, setGiftDisposalData] = useState({
    assetCode: '',
    acquireDate: '',
    disposalDate: '',
    recipient: '',
  });

  const [agricultureDisposalData, setAgricultureDisposalData] = useState({
    assetCode: '',
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
    writtenDownValue: 0,
    taxTreatment: '',
    netTaxEffect: 0,
  });

  // Disposal history - using the correct interface from DisposalHistoryTable
  const [disposalHistory, setDisposalHistory] = useState<Array<{
    id: string;
    assetCode: string;
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
          assetCode: parsedData.main?.code || '',
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
          assetId: baseAssetData.assetCode,
          acquireDate: baseAssetData.purchaseDate,
        }));

        setMfrs5DisposalData(prev => ({
          ...prev,
          assetId: baseAssetData.assetCode,
        }));

        setGiftDisposalData(prev => ({
          ...prev,
          assetCode: baseAssetData.assetCode,
          acquireDate: baseAssetData.purchaseDate,
        }));
        
        setAgricultureDisposalData(prev => ({
          ...prev,
          assetCode: baseAssetData.assetCode,
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

  // Helper function to format disposal type display
  const formatDisposalType = (disposalType: string): string => {
    switch (disposalType) {
      case 'partial':
        return 'Normal';
      case 'mfrs5':
        return 'MFRS5';
      case 'gift':
        return 'Gift';
      case 'agriculture':
        return 'Agriculture';
      default:
        return disposalType.charAt(0).toUpperCase() + disposalType.slice(1);
    }
  };

  // Calculate disposal results directly based on disposal type and asset data
  const calculateDisposalResults = (disposalType: string, assetData: AssetData): DisposalCalculationResults => {
    if (disposalType === 'gift') {
      return {
        balancingAllowance: 0,
        balancingCharge: 0,
        writtenDownValue: 0,
        taxTreatment: 'Gift Disposal - No BA/BC',
        netTaxEffect: 0,
      };
    } else if (disposalType === 'agriculture') {
      return {
        balancingAllowance: 0,
        balancingCharge: 0,
        writtenDownValue: agricultureDisposalData.disposalValue,
        taxTreatment: 'Agriculture Disposal - No Tax Impact',
        netTaxEffect: 0,
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
          writtenDownValue: wdv,
          taxTreatment: 'Balancing Charge',
          netTaxEffect: -balancingCharge,
        };
      } else {
        // Balancing allowance
        const balancingAllowance = wdv - disposalValue;
        return {
          balancingAllowance: balancingAllowance,
          balancingCharge: 0,
          writtenDownValue: wdv,
          taxTreatment: 'Balancing Allowance',
          netTaxEffect: balancingAllowance,
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
      assetCode: assetData.assetCode,
      disposalType: selectedDisposalType,
      disposalDate: assetData.disposalDate,
      disposalValue: calculationResults.writtenDownValue,
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
        // Show final results for all disposal types
        const results = calculateDisposalResults(selectedDisposalType, assetData);
        
        return (
          <Card className="space-y-6">
            <div className="border-b border-outlineVariant pb-4">
              <h3 className="text-lg font-semibold text-onBackground">Disposal Results</h3>
              <p className="text-onSurface mt-1">Review and confirm disposal results</p>
            </div>
            
            <div className="bg-surfaceContainer rounded-lg p-6">
              <h4 className="font-medium text-onBackground mb-4">Calculation Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
                  <span className="text-onSurface">Asset ID:</span>
                  <span className="font-medium text-onBackground">{assetData.assetCode}</span>
                </div>
                <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
                  <span className="text-onSurface">Disposal Type:</span>
                  <span className="font-medium text-onBackground">{formatDisposalType(selectedDisposalType)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
                  <span className="text-onSurface">Written Down Value:</span>
                  <span className="font-medium text-onBackground">RM {results.writtenDownValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
                  <span className="text-onSurface">Tax Treatment:</span>
                  <span className="font-medium text-onBackground">{results.taxTreatment}</span>
                </div>
                {results.balancingAllowance > 0 && (
                  <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
                    <span className="text-onSurface">Balancing Allowance:</span>
                    <span className="font-medium text-green">RM {results.balancingAllowance.toFixed(2)}</span>
                  </div>
                )}
                {results.balancingCharge > 0 && (
                  <div className="flex justify-between py-2 px-3 border border-outline rounded-md bg-white">
                    <span className="text-onSurface">Balancing Charge:</span>
                    <span className="font-medium text-error">RM {results.balancingCharge.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`flex pt-4 ${disposalConfirmed ? 'justify-end' : 'justify-between'}`}>
              {!disposalConfirmed && (
                <Button variant="outline" onClick={handlePreviousStep}>Previous</Button>
              )}
              <Button
                onClick={() => {
                  if (!disposalConfirmed) {
                    setCalculationResults(results);
                    handleConfirmDisposal();
                  }
                }}
                disabled={disposalConfirmed}
              >
                {disposalConfirmed ? 'Confirmed' : 'Confirm Disposal'}
              </Button>
            </div>
          </Card>
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
