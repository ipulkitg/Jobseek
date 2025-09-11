import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface JobApplication {
  id: string;
  status: string;
  coverLetter: string | null;
  appliedAt: string;
  jobPosting: {
    id: string;
    title: string;
    employer: {
      companyName: string;
    };
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

const ApplicationHistory: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadApplications();
    }
  }, [isLoaded, isSignedIn]);

  const loadApplications = async () => {
    try {
      const response = await api.get('/jobs/applications');
      setApplications(response);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Please create a profile first to view your applications.');
      } else {
        setError('Failed to load applications');
      }
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
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
      {applications.length === 0 ? (
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
          {applications.map(application => (
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
                    {application.jobPosting.employer.companyName}
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
                  gap: '8px'
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
                  View Job Details
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

export default ApplicationHistory;
