import React from 'react';

interface WizardStep {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  current: boolean;
  disabled?: boolean;
}

interface DisposalStepWizardProps {
  steps: WizardStep[];
  onStepClick?: (stepId: string) => void;
  showProgressBar?: boolean;
  allowStepNavigation?: boolean;
  className?: string;
}

const DisposalStepWizard: React.FC<DisposalStepWizardProps> = ({
  steps,
  onStepClick,
  showProgressBar = true,
  allowStepNavigation = true,
  className = '',
}) => {
  const currentStepIndex = steps.findIndex(step => step.current);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const handleStepClick = (step: WizardStep) => {
    if (!allowStepNavigation || step.disabled || !onStepClick) return;
    onStepClick(step.id);
  };

  const getStepIcon = (step: WizardStep, index: number) => {
    if (step.completed) {
      return (
        <div className="w-8 h-8 bg-primary text-onPrimary rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    } else if (step.current) {
      return (
        <div className="w-8 h-8 bg-primary text-onPrimary rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold">{index + 1}</span>
        </div>
      );
    } else {
      return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
          step.disabled 
            ? 'bg-surfaceContainer border-outlineVariant text-outline' 
            : 'bg-surfaceContainerHighest border-outlineVariant text-onSurface hover:border-primary'
        }`}>
          <span className="text-sm font-semibold">{index + 1}</span>
        </div>
      );
    }
  };

  const getStepClasses = (step: WizardStep) => {
    const baseClasses = "flex items-center space-x-3 p-3 rounded-lg transition-colors";
    
    if (step.disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    } else if (step.current) {
      return `${baseClasses} bg-primary/10 border border-primary/20`;
    } else if (step.completed) {
      return `${baseClasses} bg-green-50 border border-green-200`;
    } else if (allowStepNavigation && onStepClick) {
      return `${baseClasses} cursor-pointer hover:bg-surfaceContainer`;
    } else {
      return `${baseClasses}`;
    }
  };

  const getConnectorClasses = (step: WizardStep, nextStep?: WizardStep) => {
    if (!nextStep) return '';
    
    if (step.completed && nextStep.completed) {
      return 'bg-primary';
    } else if (step.completed || step.current) {
      return 'bg-primary';
    } else {
      return 'bg-outlineVariant';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      {showProgressBar && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900">Progress</span>
            <span className="text-sm text-gray-700">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step, index) => {
          const nextStep = steps[index + 1];
          
          return (
            <div key={step.id}>
              <div
                className={getStepClasses(step)}
                onClick={() => handleStepClick(step)}
              >
                {getStepIcon(step, index)}
                <div className="flex-grow">
                  <div className={`font-medium ${
                    step.current ? 'text-primary' : 
                    step.completed ? 'text-green-700' : 
                    step.disabled ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className={`text-sm ${
                      step.disabled ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </div>
                  )}
                </div>
                
                {/* Step Status Indicator */}
                {step.current && (
                  <div className="text-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                
                {step.completed && !step.current && (
                  <div className="text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Connector Line */}
              {nextStep && (
                <div className="flex justify-center">
                  <div className={`w-0.5 h-4 ${getConnectorClasses(step, nextStep)}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisposalStepWizard;
