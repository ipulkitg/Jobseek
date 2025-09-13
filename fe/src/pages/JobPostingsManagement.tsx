import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import JobPostingForm from '../components/JobPostingForm';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  locationState: string;
  locationCity: string;
  salaryMin: number | null;
  salaryMax: number | null;
  isActive: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  locationStateRef: {
    name: string;
  };
  _count: {
    jobApplications: number;
  };
}

interface EditingJob {
  id: string;
  title: string;
  description: string;
  requirements: string;
  locationState: string;
  locationCity: string;
  salaryMin: number | null;
  salaryMax: number | null;
  categoryId: string;
}

const JobPostingsManagement: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<EditingJob | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadJobPostings();
    }
  }, [isLoaded, isSignedIn]);

  const loadJobPostings = async () => {
    try {
      console.log('🔍 JobPostingsManagement: Loading job postings...');
      const response = await api.get('/jobs/employer');
      console.log('✅ JobPostingsManagement: Job postings loaded:', response);
      setJobPostings(response || []); // Ensure we always have an array
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('❌ JobPostingsManagement: Error loading job postings:', err);
      
      // Only show error for actual server errors, not missing profiles
      if (err.message?.includes('401')) {
        setError('Please sign in to view your job postings');
      } else if (err.message?.includes('500')) {
        setError('Server error. Please try again later.');
      } else {
        // For other errors (403, 404, etc.), just show empty state
        console.log('🔍 JobPostingsManagement: Treating as empty state rather than error');
        setJobPostings([]);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job: JobPosting) => {
    if (!job || !job.id) {
      console.error('❌ handleEditJob: Invalid job object passed:', job);
      return;
    }

    setEditingJob({
      id: job.id,
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      locationState: job.locationState || '',
      locationCity: job.locationCity || '',
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      categoryId: job.category?.id || ''
    });
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!jobId) {
      console.error('❌ handleDeleteJob: Invalid jobId provided');
      return;
    }

    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      try {
        await api.delete(`/jobs/${jobId}`);
        setJobPostings(prev => prev.filter(job => job.id !== jobId));
      } catch (err) {
        console.error('Error deleting job posting:', err);
      }
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    if (!jobId) {
      console.error('❌ handleToggleJobStatus: Invalid jobId provided');
      return;
    }

    try {
      await api.put(`/jobs/${jobId}`, {
        is_active: !currentStatus
      });
      setJobPostings(prev =>
        prev.map(job =>
          job.id === jobId
            ? { ...job, isActive: !currentStatus }
            : job
        )
      );
    } catch (err) {
      console.error('Error updating job status:', err);
    }
  };

  const handleJobFormSuccess = () => {
    loadJobPostings();
    setShowJobForm(false);
    setEditingJob(null);
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
      month: 'short',
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
        Loading job postings...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '60px 40px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '12px'
          }}>
            Unable to Load Job Postings
          </h3>
          <p style={{
            color: '#6b7280',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setError('');
                setLoading(true);
                loadJobPostings();
              }}
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
              Try Again
            </button>
            <button
              onClick={() => {
                setError('');
                handleCreateJob();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Create First Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Dashboard Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Job Postings Dashboard
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: '0'
            }}>
              Manage your job listings and track applications
            </p>
          </div>
          <button
            onClick={handleCreateJob}
            style={{
              padding: '16px 32px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            + Create New Job Posting
          </button>
        </div>

        {/* Dashboard Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                marginRight: '12px'
              }}>📝</div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#64748b',
                margin: '0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Jobs
              </h3>
            </div>
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0'
            }}>
              {jobPostings.length}
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                marginRight: '12px'
              }}>✅</div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#16a34a',
                margin: '0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Active Jobs
              </h3>
            </div>
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#15803d',
              margin: '0'
            }}>
              {jobPostings.filter(job => job.isActive).length}
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#fefce8',
            borderRadius: '12px',
            border: '1px solid #fde047'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                marginRight: '12px'
              }}>📊</div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#ca8a04',
                margin: '0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Applications
              </h3>
            </div>
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#a16207',
              margin: '0'
            }}>
              {jobPostings.reduce((total, job) => total + (job._count?.jobApplications || 0), 0)}
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#fdf4ff',
            borderRadius: '12px',
            border: '1px solid #e4d4f4'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                marginRight: '12px'
              }}>⏸️</div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#9333ea',
                margin: '0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Inactive Jobs
              </h3>
            </div>
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#7c3aed',
              margin: '0'
            }}>
              {jobPostings.filter(job => !job.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Job Postings List */}
      {jobPostings.length === 0 ? (
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
            💼
          </div>
          <h3 style={{
            color: '#6b7280',
            marginBottom: '8px',
            fontSize: '20px'
          }}>
            No job postings yet
          </h3>
          <p style={{
            color: '#9ca3af',
            marginBottom: '24px'
          }}>
            Create your first job posting to start attracting candidates
          </p>
          <button
            onClick={handleCreateJob}
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
            Create Your First Job
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {jobPostings.map(job => (
            <div
              key={job?.id || 'unknown'}
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                opacity: job?.isActive ? 1 : 0.7
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0'
                    }}>
                      {job?.title || 'Untitled Job'}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: job?.isActive ? '#10b981' : '#6b7280',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {job?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
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
                      {job?.category?.name || 'Unknown Category'}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      📍 {job?.locationCity || 'Unknown City'}, {job?.locationStateRef?.name || 'Unknown State'}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      💰 {formatSalary(job?.salaryMin, job?.salaryMax)}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      📝 {job?._count?.jobApplications || 0} application{(job?._count?.jobApplications || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}>
                  <span style={{
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    Created {job?.createdAt ? formatDate(job.createdAt) : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <p style={{
                color: '#4b5563',
                lineHeight: '1.6',
                marginBottom: '16px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {job.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => job?.id && handleEditJob(job)}
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
                    Edit
                  </button>
                  <button
                    onClick={() => job?.id && handleToggleJobStatus(job.id, job.isActive)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: job.isActive ? '#f59e0b' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {job.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => job?.id && handleDeleteJob(job.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
                
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  Job ID: {job?.id ? job.id.slice(0, 8) : 'unknown'}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Posting Form Modal */}
      {showJobForm && (
        <JobPostingForm
          isOpen={showJobForm}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
          onSuccess={handleJobFormSuccess}
          editingJob={editingJob}
        />
      )}
    </div>
  );
};

export default JobPostingsManagement;
