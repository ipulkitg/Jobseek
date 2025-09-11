import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface JobApplication {
  id: string;
  status: string;
  coverLetter: string | null;
  appliedAt: string;
  jobSeeker: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  jobPosting: {
    id: string;
    title: string;
    category: {
      name: string;
    };
    locationStateRef: {
      name: string;
    };
    locationCity: string;
    salaryMin: number | null;
    salaryMax: number | null;
  };
}

const ApplicationsManagement: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadApplications();
    }
  }, [isLoaded, isSignedIn]);

  const loadApplications = async () => {
    try {
      const response = await api.get('/jobs/applications/employer');
      setApplications(response);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Please create a profile first to view applications.');
      } else if (err.response?.status === 403) {
        setError('Only employers can view applications.');
      } else {
        setError('Failed to load applications');
      }
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await api.put(`/jobs/applications/${applicationId}`, {
        status: newStatus
      });
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'reviewed':
        return '#3b82f6';
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'reviewed':
        return '👀';
      case 'accepted':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '📄';
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

  // Get unique jobs for filter
  const uniqueJobs = Array.from(
    new Set(applications.map(app => app.jobPosting.title))
  ).map(title => ({
    title,
    id: applications.find(app => app.jobPosting.title === title)?.jobPosting.id || ''
  }));

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesJob = !selectedJob || app.jobPosting.title === selectedJob;
    const matchesStatus = !statusFilter || app.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesJob && matchesStatus;
  });

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
          Applications Management
        </h2>
        <p style={{
          color: '#6b7280',
          margin: '0 0 20px 0'
        }}>
          Review and manage job applications from candidates
        </p>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Filter by Job
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Jobs</option>
              {uniqueJobs.map(job => (
                <option key={job.id} value={job.title}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
          </span>
          <button
            onClick={() => {
              setSelectedJob('');
              setStatusFilter('');
            }}
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
            Clear Filters
          </button>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
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
            📋
          </div>
          <h3 style={{
            color: '#6b7280',
            marginBottom: '8px',
            fontSize: '20px'
          }}>
            No applications found
          </h3>
          <p style={{
            color: '#9ca3af',
            marginBottom: '24px'
          }}>
            {applications.length === 0 
              ? "No applications have been submitted yet. Share your job postings to attract candidates."
              : "No applications match your current filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {filteredApplications.map(application => (
            <div
              key={application.id}
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
                    {application.jobPosting.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#3b82f6',
                    margin: '0 0 8px 0',
                    fontWeight: '500'
                  }}>
                    {application.jobSeeker.firstName} {application.jobSeeker.lastName}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0 0 12px 0'
                  }}>
                    {application.jobSeeker.email}
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
                      {application.jobPosting.category.name}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      📍 {application.jobPosting.locationCity}, {application.jobPosting.locationStateRef.name}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      💰 {formatSalary(application.jobPosting.salaryMin, application.jobPosting.salaryMax)}
                    </span>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: `${getStatusColor(application.status)}20`,
                    color: getStatusColor(application.status),
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <span>{getStatusIcon(application.status)}</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {application.status}
                    </span>
                  </div>
                  
                  {/* Status Update Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {application.status.toLowerCase() !== 'reviewed' && (
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Reviewed
                      </button>
                    )}
                    {application.status.toLowerCase() !== 'accepted' && (
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'accepted')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Accept
                      </button>
                    )}
                    {application.status.toLowerCase() !== 'rejected' && (
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                  
                  <span style={{
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    Applied {formatDate(application.appliedAt)}
                  </span>
                </div>
              </div>

              {application.coverLetter && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 8px 0'
                  }}>
                    Cover Letter:
                  </h4>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    margin: '0',
                    fontSize: '14px'
                  }}>
                    {application.coverLetter}
                  </p>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    color: '#3b82f6',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  View Full Profile
                </button>
                
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  Application ID: {application.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {applications.length > 0 && (
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
            {['pending', 'reviewed', 'accepted', 'rejected'].map(status => {
              const count = applications.filter(app => 
                app.status.toLowerCase() === status
              ).length;
              return (
                <div key={status} style={{
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: getStatusColor(status),
                    marginBottom: '4px'
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    textTransform: 'capitalize'
                  }}>
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagement;
