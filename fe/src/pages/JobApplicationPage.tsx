import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import ApplicationStepper from '../components/ApplicationStepper';
import ApplicationStepContent from '../components/ApplicationStepContent';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  locationState: string;
  locationCity: string;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
  applicationSteps: string[];
  employer: {
    companyName: string;
    companyDescription?: string;
  };
  category: {
    name: string;
  };
  locationStateRef: {
    name: string;
  };
}

interface Step {
  id: string;
  title: string;
  description: string;
}

const JobApplicationPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { profile } = useProfile();

  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('personal_info');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [applicationData, setApplicationData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Define steps configuration
  const getSteps = (applicationSteps: string[]): Step[] => {
    const stepConfig: Record<string, Step> = {
      personal_info: {
        id: 'personal_info',
        title: 'Personal Information',
        description: 'Basic contact and personal details'
      },
      technical_assessment: {
        id: 'technical_assessment',
        title: 'Technical Assessment',
        description: 'Skills, experience, and technical background'
      },
      review_submit: {
        id: 'review_submit',
        title: 'Review & Submit',
        description: 'Review your application and submit'
      }
    };

    return applicationSteps.map(stepId => stepConfig[stepId]).filter(Boolean);
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    const loadJobDetails = async () => {
      if (!jobId) {
        setError('Job ID not provided');
        setLoading(false);
        return;
      }

      try {
        const jobData = await api.get(`/jobs/${jobId}`);
        setJob(jobData);

        // Check if user has already applied to this job
        if (isSignedIn) {
          try {
            const appliedJobIds = await api.get('/jobs/applied-jobs');
            if (appliedJobIds.includes(jobId)) {
              // User has already applied, redirect back to job details
              navigate(`/jobs/${jobId}`, {
                state: { alreadyApplied: true }
              });
              return;
            }
          } catch (applyErr) {
            console.log('⚠️ JobApplicationPage: Could not check application status');
          }
        }

        // Set initial step based on job's application steps
        if (jobData.applicationSteps && jobData.applicationSteps.length > 0) {
          setCurrentStep(jobData.applicationSteps[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId, isSignedIn, isLoaded, navigate]);

  const handleStepClick = (stepId: string) => {
    // Allow navigation to completed steps or current step
    if (completedSteps.includes(stepId) || stepId === currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleStepDataChange = (stepData: any) => {
    setApplicationData(prev => ({
      ...prev,
      [currentStep]: stepData
    }));
  };

  const validateCurrentStep = (): boolean => {
    const stepData = applicationData[currentStep] || {};

    switch (currentStep) {
      case 'personal_info':
        return !!(stepData.name && stepData.email && stepData.phone && stepData.phone.length >= 10);
      case 'technical_assessment':
        return !!stepData.technicalAssessment;
      case 'review_submit':
        return true; // Review step doesn't need validation
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!job?.applicationSteps) return;

    if (!validateCurrentStep()) {
      setSubmitError('Please complete all required fields before proceeding.');
      return;
    }

    setSubmitError(null);

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    // Move to next step
    const currentIndex = job.applicationSteps.indexOf(currentStep);
    if (currentIndex < job.applicationSteps.length - 1) {
      setCurrentStep(job.applicationSteps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!job?.applicationSteps) return;

    const currentIndex = job.applicationSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(job.applicationSteps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!job) return;

    if (!validateCurrentStep()) {
      setSubmitError('Please complete all required fields before submitting.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Combine all step data
      const combinedData = Object.values(applicationData).reduce((acc, stepData) => ({
        ...acc,
        ...stepData
      }), {});

      try {
        await api.post(`/jobs/${job.id}/apply`, {
          cover_letter: combinedData.coverLetter || '',
          application_data: combinedData
        });

        // Success! Store the applied job ID in localStorage
        const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        if (!appliedJobs.includes(job.id)) {
          appliedJobs.push(job.id);
          localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        }

        // Navigate back to job details with success message
        navigate(`/jobs/${job.id}`, {
          state: { applicationSubmitted: true }
        });
      } catch (error: any) {
        // If we get "already applied" error, still add to localStorage
        if (error.message && error.message.includes('already applied')) {
          const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
          if (!appliedJobs.includes(job.id)) {
            appliedJobs.push(job.id);
            localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
          }

          // Navigate back to job details
          navigate(`/jobs/${job.id}`, {
            state: { applicationSubmitted: true }
          });
        } else {
          // Re-throw other errors
          throw error;
        }
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToJob = () => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          {error || 'Job not found'}
        </div>
        <button
          onClick={handleBackToJob}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Back to Job Details
        </button>
      </div>
    );
  }

  const steps = getSteps(job.applicationSteps);
  const currentStepIndex = job.applicationSteps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === job.applicationSteps.length - 1;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      {/* Left Sidebar - Stepper */}
      <ApplicationStepper
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Right Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                marginBottom: '4px'
              }}>
                Apply to {job.title}
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                {job.employer.companyName} • {job.locationCity}, {job.locationStateRef.name}
              </p>
            </div>
            <button
              onClick={handleBackToJob}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Back to Job
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ApplicationStepContent
            stepId={currentStep}
            data={applicationData[currentStep]}
            onDataChange={handleStepDataChange}
            userProfile={profile}
            applicationSteps={job?.applicationSteps}
            allApplicationData={applicationData}
          />
        </div>

        {/* Footer with Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          {/* Error Message */}
          {submitError && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {submitError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              style={{
                padding: '12px 24px',
                backgroundColor: isFirstStep ? '#f3f4f6' : 'white',
                color: isFirstStep ? '#9ca3af' : '#374151',
                border: `1px solid ${isFirstStep ? '#e5e7eb' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isFirstStep ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: submitting ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationPage;
