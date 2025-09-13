import React from 'react';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface ApplicationStepperProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  onStepClick: (stepId: string) => void;
}

const ApplicationStepper: React.FC<ApplicationStepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const isStepActive = (stepId: string) => stepId === currentStep;
  const isStepClickable = (stepId: string) => isStepCompleted(stepId) || stepId === currentStep;

  return (
    <div style={{
      width: '320px',
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb'
    }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Application Progress
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280'
          }}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: '#1e40af',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step.id);
          const isActive = isStepActive(step.id);
          const isClickable = isStepClickable(step.id);

          return (
            <div
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: isClickable ? 1 : 0.6
              }}
            >
              {/* Step Indicator */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: isCompleted ? '#1e40af' : isActive ? '#1e40af' : '#f3f4f6',
                border: isActive ? '2px solid #1e40af' : '2px solid #e5e7eb',
                color: isCompleted || isActive ? '#ffffff' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}>
                {isCompleted ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isCompleted ? '#1e40af' : isActive ? '#1e40af' : '#374151',
                  marginBottom: '2px'
                }}>
                  {step.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationStepper;
