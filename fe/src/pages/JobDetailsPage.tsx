import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import JobApplicationModal from '../components/JobApplicationModal';

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

const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!jobId) {
        setError('Job ID not provided');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 JobDetailsPage: Loading job details for ID:', jobId);
        const jobData = await api.get(`/jobs/${jobId}`);
        console.log('✅ JobDetailsPage: Loaded job data:', jobData);
        setJob(jobData);

        // Check if user has applied to this job
        const storedApplied = localStorage.getItem('appliedJobs');
        if (storedApplied) {
          const appliedJobs = JSON.parse(storedApplied);
          setIsApplied(appliedJobs.includes(jobId));
        }
      } catch (err) {
        console.error('❌ JobDetailsPage: Failed to load job details:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId]);

  const handleApplyClick = () => {
    if (isApplied || !job) return;
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    if (job) {
      // Update applied state
      setIsApplied(true);
      
      // Update localStorage
      const storedApplied = localStorage.getItem('appliedJobs');
      const appliedJobs = storedApplied ? JSON.parse(storedApplied) : [];
      if (!appliedJobs.includes(job.id)) {
        appliedJobs.push(job.id);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
      }
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (!min) return `Up to $${max?.toLocaleString()}`;
    if (!max) return `$${min?.toLocaleString()}+`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px'
      }}>
        Loading job details...
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
        height: '400px',
        gap: '20px'
      }}>
        <div style={{ color: 'red', fontSize: '18px' }}>
          {error || 'Job not found'}
        </div>
        <button
          onClick={() => navigate(-1)}
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
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: '8px 16px',
          backgroundColor: 'white',
          color: '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← Back
      </button>

      {/* Job Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              {job.title}
            </h1>
            <h2 style={{
              fontSize: '20px',
              color: '#3b82f6',
              margin: '0 0 16px 0',
              fontWeight: '600'
            }}>
              {job.employer?.companyName || 'Unknown Company'}
            </h2>
            
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {job.category?.name || 'Unknown Category'}
                </span>
              </div>
              
              <div style={{ color: '#6b7280', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                📍 {job.locationCity}, {job.locationStateRef?.name || 'Unknown State'}
              </div>
              
              <div style={{ color: '#6b7280', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                💰 {formatSalary(job.salaryMin, job.salaryMax)}
              </div>
              
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                Posted on {formatDate(job.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        {isSignedIn && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {isApplied ? (
              <button
                disabled
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  opacity: 0.8
                }}
              >
                ✓ Applied
              </button>
            ) : (
              <button
                onClick={handleApplyClick}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Apply Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Job Description */}
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Job Description
        </h3>
        <div style={{
          color: '#4b5563',
          lineHeight: '1.6',
          fontSize: '16px',
          whiteSpace: 'pre-wrap'
        }}>
          {job.description}
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Requirements
          </h3>
          <div style={{
            color: '#4b5563',
            lineHeight: '1.6',
            fontSize: '16px',
            whiteSpace: 'pre-wrap'
          }}>
            {job.requirements}
          </div>
        </div>
      )}

      {/* Company Information */}
      {job.employer?.companyDescription && (
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            About {job.employer.companyName}
          </h3>
          <div style={{
            color: '#4b5563',
            lineHeight: '1.6',
            fontSize: '16px',
            whiteSpace: 'pre-wrap'
          }}>
            {job.employer.companyDescription}
          </div>
        </div>
      )}

      {/* Application Modal */}
      {job && (
        <JobApplicationModal
          job={job}
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobDetailsPage;
