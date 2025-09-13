import React, { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  locationState?: string;
  locationCity?: string;
}

interface ApplicationStepContentProps {
  stepId: string;
  data: any;
  onDataChange: (data: any) => void;
  userProfile: UserProfile | null;
  applicationSteps?: string[];
  allApplicationData?: Record<string, any>;
}

const ApplicationStepContent: React.FC<ApplicationStepContentProps> = ({
  stepId,
  data,
  onDataChange,
  userProfile,
  applicationSteps,
  allApplicationData
}) => {
  const [localData, setLocalData] = useState(data || {});

  useEffect(() => {
    // Initialize with existing data or pre-fill with user profile data
    let initialData = data || {};

    if (stepId === 'personal_info' && userProfile && Object.keys(initialData).length === 0) {
      // Pre-fill personal info with user profile data if no existing data
      initialData = {
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        ...initialData
      };
    }

    setLocalData(initialData);
  }, [data, stepId, userProfile]);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onDataChange(newData);
  };

  const renderPersonalInfoStep = () => {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Personal Information
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Please provide your personal details for this application.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          {/* Full Name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              value={localData.name || userProfile?.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              value={localData.email || userProfile?.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Phone Number *
              </label>
              <input
                type="text"
                value={localData.phone || userProfile?.phone || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                  handleInputChange('phone', value);
                }}
                placeholder="5551234567"
                required
                pattern="[0-9]*"
                maxLength={10}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={localData.dateOfBirth || ''}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Address */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Address
            </label>
            <textarea
              value={localData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your full address"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTechnicalAssessmentStep = () => {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Technical Assessment
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Please provide details about your technical skills, experience, and relevant projects.
          </p>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Technical Skills & Experience *
          </label>
          <textarea
            value={localData.technicalAssessment || ''}
            onChange={(e) => handleInputChange('technicalAssessment', e.target.value)}
            placeholder="Describe your technical background, programming languages, frameworks, and relevant experience. Include details about projects you've worked on, challenges you've solved, and any coding challenges or assessments you've completed."
            required
            rows={12}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
        </div>
      </div>
    );
  };

  const renderReviewSubmitStep = () => {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Review & Submit Application
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Please review all the information you've provided before submitting your application.
          </p>
        </div>

        {/* Dynamic sections based on application steps */}
        {applicationSteps?.map((stepId) => {
          if (stepId === 'review_submit') return null; // Don't show review step itself

          const stepData = allApplicationData?.[stepId] || {};
          let sectionTitle = '';
          let sectionContent = null;

          switch (stepId) {
            case 'personal_info':
              sectionTitle = 'Personal Information';
              sectionContent = (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  fontSize: '14px'
                }}>
                  <div>
                    <strong>Name:</strong> {stepData.name || 'Not provided'}
                  </div>
                  <div>
                    <strong>Email:</strong> {stepData.email || 'Not provided'}
                  </div>
                  <div>
                    <strong>Phone:</strong> {stepData.phone || 'Not provided'}
                  </div>
                  <div>
                    <strong>Date of Birth:</strong> {stepData.dateOfBirth || 'Not provided'}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Address:</strong> {stepData.address || 'Not provided'}
                  </div>
                </div>
              );
              break;

            case 'technical_assessment':
              sectionTitle = 'Technical Assessment';
              sectionContent = (
                <div style={{ fontSize: '14px' }}>
                  <div style={{
                    maxHeight: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {stepData.technicalAssessment || 'No technical information provided'}
                  </div>
                </div>
              );
              break;
          }

          if (!sectionContent) return null;

          return (
            <div key={stepId} style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {sectionTitle}
                </h3>
                <button
                  onClick={() => {/* TODO: Navigate to specific step */}}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Edit
                </button>
              </div>
              {sectionContent}
            </div>
          );
        })}

        {/* Submit Notice */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#92400e',
            margin: 0
          }}>
            By submitting this application, you confirm that all information provided is accurate and complete.
            The employer will review your application and may contact you for further information.
          </p>
        </div>
      </div>
    );
  };

  switch (stepId) {
    case 'personal_info':
      return renderPersonalInfoStep();
    case 'technical_assessment':
      return renderTechnicalAssessmentStep();
    case 'review_submit':
      return renderReviewSubmitStep();
    default:
      return (
        <div style={{ padding: '24px' }}>
          <p>Unknown step: {stepId}</p>
        </div>
      );
  }
};

export default ApplicationStepContent;
