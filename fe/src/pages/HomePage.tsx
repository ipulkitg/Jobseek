import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '0'
    }}>
      <header style={{
        textAlign: 'center',
        padding: '60px 20px 40px 20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 16px 0'
        }}>
          Job Portal
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#6b7280',
          margin: '0',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Connecting Blue-Collar & White-Collar Workers with Employers
        </p>
      </header>
      
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 24px 0'
          }}>
            Find Your Next Opportunity
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            margin: '0 0 40px 0'
          }}>
            Choose your path to get started
          </p>
          
          <div style={{
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Job Seeker Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px 32px',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '300px',
              flex: '1',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>
                🔍
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 12px 0'
              }}>
                Looking for Jobs
              </h3>
              <p style={{
                color: '#6b7280',
                margin: '0 0 24px 0',
                lineHeight: '1.6'
              }}>
                Browse thousands of jobs, create your profile, and apply with ease
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <Link 
                  to="/job-seeker/sign-up"
                  style={{
                    display: 'inline-block',
                    padding: '16px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }}
                >
                  Sign Up as Job Seeker
                </Link>
                <Link 
                  to="/job-seeker/sign-in"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>

            {/* Employer Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px 32px',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '300px',
              flex: '1',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>
                💼
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 12px 0'
              }}>
                Looking to Hire
              </h3>
              <p style={{
                color: '#6b7280',
                margin: '0 0 24px 0',
                lineHeight: '1.6'
              }}>
                Post jobs, manage applications, and find the perfect candidates
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <Link 
                  to="/employer/sign-up"
                  style={{
                    display: 'inline-block',
                    padding: '16px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }}
                >
                  Sign Up as Employer
                </Link>
                <Link 
                  to="/employer/sign-in"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#10b981',
                    textDecoration: 'none',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          marginTop: '60px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              For Job Seekers
            </h3>
            <ul style={{
              color: '#6b7280',
              lineHeight: '1.6',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li>Browse jobs from trusted employers</li>
              <li>Create a detailed profile with your skills</li>
              <li>Apply with one click</li>
              <li>Track your application status</li>
              <li>Get matched with relevant opportunities</li>
            </ul>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              For Employers
            </h3>
            <ul style={{
              color: '#6b7280',
              lineHeight: '1.6',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li>Post unlimited job listings</li>
              <li>Reach qualified candidates</li>
              <li>Manage applications efficiently</li>
              <li>Build your company profile</li>
              <li>Find the right talent quickly</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
