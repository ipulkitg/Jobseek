import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import JobPostingsManagement from './JobPostingsManagement';
import ApplicationsManagement from './ApplicationsManagement';

const EmployerDashboard: React.FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { } = useAuth(); // Keep useAuth import but don't use unused vars
  const { profile, loading: profileLoading, hasProfile } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'applications'>('dashboard');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Note: Removed automatic redirect to profile-setup to let users see the dashboard
  // The dashboard will show appropriate messaging about needing a profile

  if (!isLoaded || profileLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        {profileLoading ? 'Checking company profile...' : 'Loading...'}
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return <JobPostingsManagement />;
      case 'applications':
        return <ApplicationsManagement />;
      default:
        return (
          <div className="welcome-section">
            {!hasProfile && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#dc2626' }}>Company profile required</h3>
                  <p style={{ margin: 0, color: '#dc2626' }}>You must create a company profile to post jobs and manage applications. This is mandatory for employers.</p>
                </div>
                <button
                  onClick={() => navigate('/profile-setup?role=employer')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Create Profile
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Welcome back, {profile?.companyName || user?.firstName || 'Employer'}!</h2>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  {hasProfile ? 'Manage your job postings and applications' : 'Complete your company profile to access job management features'}
                </p>
              </div>
              {hasProfile && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate('/profile')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => navigate('/profile-setup')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: '#3b82f6',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
            
            <div className="quick-actions" style={{ marginTop: '32px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => hasProfile && setActiveTab('jobs')}
                disabled={!hasProfile}
                style={{
                  padding: '12px 24px',
                  backgroundColor: hasProfile ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: hasProfile ? 'pointer' : 'not-allowed',
                  marginRight: '16px',
                  opacity: hasProfile ? 1 : 0.6
                }}
                title={!hasProfile ? 'Create a company profile to manage jobs' : ''}
              >
                Manage Jobs
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => hasProfile && setActiveTab('applications')}
                disabled={!hasProfile}
                style={{
                  padding: '12px 24px',
                  backgroundColor: hasProfile ? 'white' : '#f3f4f6',
                  color: hasProfile ? '#3b82f6' : '#9ca3af',
                  border: hasProfile ? '2px solid #3b82f6' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: hasProfile ? 'pointer' : 'not-allowed',
                  opacity: hasProfile ? 1 : 0.6
                }}
                title={!hasProfile ? 'Create a company profile to view applications' : ''}
              >
                View Applications
              </button>
            </div>
            
            <div className="job-stats" style={{ marginTop: '48px' }}>
              <h3>Quick Overview</h3>
              <p>
                {hasProfile 
                  ? 'Use the tabs above to manage your job postings and review applications from candidates.'
                  : 'Complete your company profile to unlock job posting and application management features.'
                }
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="employer-dashboard" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <header className="dashboard-header" style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Employer Dashboard</h1>
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'dashboard' ? '#3b82f6' : 'white',
              color: activeTab === 'dashboard' ? 'white' : '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button 
            className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => hasProfile && setActiveTab('jobs')}
            disabled={!hasProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: hasProfile ? (activeTab === 'jobs' ? '#3b82f6' : 'white') : '#f3f4f6',
              color: hasProfile ? (activeTab === 'jobs' ? 'white' : '#3b82f6') : '#9ca3af',
              border: hasProfile ? '2px solid #3b82f6' : '2px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: hasProfile ? 'pointer' : 'not-allowed',
              opacity: hasProfile ? 1 : 0.6
            }}
            title={!hasProfile ? 'Create a company profile to access job postings' : ''}
          >
            Job Postings
          </button>
          <button 
            className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => hasProfile && setActiveTab('applications')}
            disabled={!hasProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: hasProfile ? (activeTab === 'applications' ? '#3b82f6' : 'white') : '#f3f4f6',
              color: hasProfile ? (activeTab === 'applications' ? 'white' : '#3b82f6') : '#9ca3af',
              border: hasProfile ? '2px solid #3b82f6' : '2px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: hasProfile ? 'pointer' : 'not-allowed',
              opacity: hasProfile ? 1 : 0.6
            }}
            title={!hasProfile ? 'Create a company profile to access applications' : ''}
          >
            Applications
          </button>
          <UserButton afterSignOutUrl="/" />
        </nav>
      </header>
      
      <main className="dashboard-content" style={{ padding: '24px' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default EmployerDashboard;
