import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import JobPostingsManagement from './JobPostingsManagement';
import ApplicationsManagement from './ApplicationsManagement';

const EmployerDashboard: React.FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { isSignedIn: authIsSignedIn, isLoaded: authIsLoaded } = useAuth();
  const { profile, loading: profileLoading, hasProfile } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'applications'>('dashboard');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Allow access to dashboard even without profile
  // useEffect(() => {
  //   if (isLoaded && isSignedIn && !profileLoading && !profile) {
  //     navigate('/profile-setup');
  //   }
  // }, [isLoaded, isSignedIn, profileLoading, profile, navigate]);

  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
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
            {!profileLoading && !hasProfile && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#92400e' }}>Complete your company profile</h3>
                  <p style={{ margin: 0, color: '#92400e' }}>Add company details to start posting jobs and attract candidates</p>
                </div>
                <button
                  onClick={() => navigate('/profile-setup')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Make a Profile
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Welcome back, {profile?.companyName || user?.firstName || 'Employer'}!</h2>
                <p style={{ margin: 0, color: '#6b7280' }}>Manage your job postings and applications</p>
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
                onClick={() => setActiveTab('jobs')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginRight: '16px'
                }}
              >
                Manage Jobs
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setActiveTab('applications')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  border: '2px solid #3b82f6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                View Applications
              </button>
            </div>
            
            <div className="job-stats" style={{ marginTop: '48px' }}>
              <h3>Quick Overview</h3>
              <p>Use the tabs above to manage your job postings and review applications from candidates.</p>
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
            onClick={() => setActiveTab('jobs')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'jobs' ? '#3b82f6' : 'white',
              color: activeTab === 'jobs' ? 'white' : '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Job Postings
          </button>
          <button 
            className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'applications' ? '#3b82f6' : 'white',
              color: activeTab === 'applications' ? 'white' : '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
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
