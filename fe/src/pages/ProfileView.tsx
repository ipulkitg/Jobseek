import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';

const ProfileView: React.FC = () => {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>No Profile Found</h2>
          <p style={{ marginBottom: '24px', color: '#6b7280' }}>
            You haven't created a profile yet. Create one to access all features.
          </p>
          <button
            onClick={() => navigate('/profile-setup')}
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
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
              {profile.name}
            </h1>
            <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
              {profile.role === 'job_seeker' ? 'Job Seeker' : 'Employer'} Profile
            </p>
          </div>
          <button
            onClick={() => navigate('/profile-setup')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Basic Information */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '8px'
            }}>
              Basic Information
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Email
                </label>
                <p style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
                  {profile.email}
                </p>
              </div>
              {profile.phone && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Phone
                  </label>
                  <p style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
                    {profile.phone}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Location */}
          {(profile.locationStateName || profile.locationCity) && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '8px'
              }}>
                Location
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {profile.locationStateName && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      State
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
                      {profile.locationStateName}
                    </p>
                  </div>
                )}
                {profile.locationCity && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      City
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
                      {profile.locationCity}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Job Seeker Specific Information */}
          {profile.role === 'job_seeker' && (
            <>
              {profile.skills && profile.skills.length > 0 && (
                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '16px',
                    borderBottom: '2px solid #e5e7eb',
                    paddingBottom: '8px'
                  }}>
                    Skills
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              
              {profile.resumeUrl && (
                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '16px',
                    borderBottom: '2px solid #e5e7eb',
                    paddingBottom: '8px'
                  }}>
                    Resume
                  </h2>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    View Resume
                  </a>
                </section>
              )}
            </>
          )}

          {/* Employer Specific Information */}
          {profile.role === 'employer' && (
            <>
              {profile.companyName && (
                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '16px',
                    borderBottom: '2px solid #e5e7eb',
                    paddingBottom: '8px'
                  }}>
                    Company Information
                  </h2>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Company Name
                    </label>
                    <p style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                      {profile.companyName}
                    </p>
                  </div>
                  
                  {profile.companyDescription && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        Company Description
                      </label>
                      <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', lineHeight: '1.6' }}>
                        {profile.companyDescription}
                      </p>
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          <div style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => navigate(profile.role === 'job_seeker' ? '/job-seeker' : '/employer')}
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
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/profile-setup')}
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
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;