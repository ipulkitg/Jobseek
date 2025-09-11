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
      const response = await api.get('/jobs/employer');
      setJobPostings(response);
    } catch (err) {
      setError('Failed to load job postings');
      console.error('Error loading job postings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      locationState: job.locationState,
      locationCity: job.locationCity,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      categoryId: job.category.id
    });
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId: string) => {
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Job Postings Management
            </h2>
            <p style={{
              color: '#6b7280',
              margin: '0'
            }}>
              Create, edit, and manage your job postings
            </p>
          </div>
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
            + Create New Job
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            {jobPostings.length} job posting{jobPostings.length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {jobPostings.filter(job => job.isActive).length} Active
            </span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#6b7280',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {jobPostings.filter(job => !job.isActive).length} Inactive
            </span>
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
              key={job.id}
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                opacity: job.isActive ? 1 : 0.7
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
                      {job.title}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: job.isActive ? '#10b981' : '#6b7280',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {job.isActive ? 'Active' : 'Inactive'}
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
                      {job.category.name}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      📍 {job.locationCity}, {job.locationStateRef.name}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      💰 {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      📝 {job._count.jobApplications} application{job._count.jobApplications !== 1 ? 's' : ''}
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
                    Created {formatDate(job.createdAt)}
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
                    onClick={() => handleEditJob(job)}
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
                    onClick={() => handleToggleJobStatus(job.id, job.isActive)}
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
                    onClick={() => handleDeleteJob(job.id)}
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
                  Job ID: {job.id.slice(0, 8)}...
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
