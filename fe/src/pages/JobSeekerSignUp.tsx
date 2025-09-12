import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';

const JobSeekerSignUp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        marginBottom: '32px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          Job Seeker Sign Up
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '0 0 16px 0'
        }}>
          Create your account to start applying for jobs and build your career
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          alignItems: 'center',
          color: '#3b82f6',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <span>✓</span>
          <span>Browse all jobs</span>
          <span>•</span>
          <span>✓</span>
          <span>Easy applications</span>
          <span>•</span>
          <span>✓</span>
          <span>Track your progress</span>
        </div>
      </div>

      <SignUp 
        afterSignUpUrl="/profile-setup?role=job_seeker"
        afterSignInUrl="/profile-setup?role=job_seeker"
        fallbackRedirectUrl="/profile-setup?role=job_seeker"
      />

      <div style={{
        marginTop: '24px',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 8px 0'
        }}>
          Looking to hire instead?
        </p>
        <button
          onClick={() => navigate('/employer/sign-up')}
          style={{
            background: 'none',
            border: 'none',
            color: '#10b981',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Sign up as an employer
        </button>
      </div>
    </div>
  );
};

export default JobSeekerSignUp;
