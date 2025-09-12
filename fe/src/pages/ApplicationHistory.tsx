import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface AppliedJob {
  jobId: string;
  appliedAt: string; // We'll generate this from localStorage or use current date
}

interface JobPosting {
  id: string;
  title: string;
  employer?: {
    companyName?: string;
  };
  category?: {
    name?: string;
  };
  locationStateRef?: {
    name?: string;
  };
  locationCity?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
}

const ApplicationHistory: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [jobDetails, setJobDetails] = useState<{ [key: string]: JobPosting }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadApplications();
    }
  }, [isLoaded, isSignedIn]);

  const loadApplications = async () => {
    try {
      console.log('🔍 ApplicationHistory: Loading applications from localStorage');
      
      // Get applied jobs from localStorage
      const storedApplied = localStorage.getItem('appliedJobs');
      if (!storedApplied) {
        console.log('📝 ApplicationHistory: No applied jobs found in localStorage');
        setAppliedJobs([]);
        setLoading(false);
        return;
      }

      const jobIds = JSON.parse(storedApplied);
      console.log('✅ ApplicationHistory: Found applied job IDs:', jobIds);

      // Create applied jobs array with timestamps (we don't have real timestamps, so we'll use a default)
      const appliedJobsArray = jobIds.map((jobId: string) => ({
        jobId,
        appliedAt: new Date().toISOString() // Default timestamp - in real app this would come from backend
      }));
      
      setAppliedJobs(appliedJobsArray);

      // Fetch job details for each applied job
      const jobDetailsMap: { [key: string]: JobPosting } = {};
      
      for (const jobId of jobIds) {
        try {
          console.log(`🔍 ApplicationHistory: Fetching details for job ${jobId}`);
          const jobDetail = await api.get(`/jobs/${jobId}`);
          jobDetailsMap[jobId] = jobDetail;
          console.log(`✅ ApplicationHistory: Loaded details for job ${jobId}: ${jobDetail.title}`);
        } catch (jobErr) {
          console.error(`❌ ApplicationHistory: Failed to load job ${jobId}:`, jobErr);
          // Skip jobs that can't be loaded
        }
      }

      setJobDetails(jobDetailsMap);
      setError(null);
      
      console.log('✅ ApplicationHistory: Successfully loaded application history');
    } catch (err: any) {
      console.error('❌ ApplicationHistory: Error loading applications:', err);
      setError('Unable to load application history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJobDetails = (jobId: string) => {
    console.log('🔍 ApplicationHistory: Navigating to job details:', jobId);
    navigate(`/jobs/${jobId}`);
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (!min) return `Up to ${max?.toLocaleString()}`;
    if (!max) return `${min?.toLocaleString()}+`;
    return `${min?.toLocaleString()} - ${max?.toLocaleString()}`;
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
        Loading applications...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: 'red'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          My Applications
        </h2>
        <p style={{
          color: '#6b7280',
          margin: '0'
        }}>
          Track the status of your job applications
        </p>
      </div>

      {/* Applications List */}
      {appliedJobs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            📝
          </div>
          <h3 style={{
            color: '#6b7280',
            marginBottom: '8px',
            fontSize: '20px'
          }}>
            No applications yet
          </h3>
          <p style={{
            color: '#9ca3af',
            marginBottom: '24px'
          }}>
            Start browsing jobs and apply to positions that interest you
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {appliedJobs.map(appliedJob => {
            const job = jobDetails[appliedJob.jobId];
            
            // Skip jobs that couldn't be loaded
            if (!job) {
              return (
                <div
                  key={appliedJob.jobId}
                  style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    padding: '20px'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                    <h3>Job Details Unavailable</h3>
                    <p>This job listing may have been removed or is temporarily unavailable.</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                      Job ID: {appliedJob.jobId.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={appliedJob.jobId}
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      {job.title || 'Unknown Job Title'}
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      color: '#3b82f6',
                      margin: '0 0 8px 0',
                      fontWeight: '500'
                    }}>
                      {job.employer?.companyName || 'Unknown Company'}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {job.category?.name || 'Unknown Category'}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        📍 {job.locationCity || 'Unknown City'}, {job.locationStateRef?.name || 'Unknown State'}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        💰 {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#f59e0b20',
                      color: '#f59e0b',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <span>📝</span>
                      <span>Applied</span>
                    </div>
                    <span style={{
                      color: '#9ca3af',
                      fontSize: '14px'
                    }}>
                      Applied {formatDate(appliedJob.appliedAt)}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={() => handleViewJobDetails(appliedJob.jobId)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    View Job Details
                  </button>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    Job ID: {appliedJob.jobId.slice(0, 8)}...
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {appliedJobs.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 16px 0'
          }}>
            Application Summary
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#f59e0b',
                marginBottom: '4px'
              }}>
                {appliedJobs.length}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Total Applications
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#10b981',
                marginBottom: '4px'
              }}>
                {Object.keys(jobDetails).length}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Jobs Available
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationHistory;
