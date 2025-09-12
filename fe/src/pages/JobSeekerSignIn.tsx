import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';

const JobSeekerSignIn: React.FC = () => {
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
          Job Seeker Sign In
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '0'
        }}>
          Access your job seeker dashboard to find and apply for jobs
        </p>
      </div>

      <SignIn 
        afterSignInUrl="/login?intended=job_seeker"
        fallbackRedirectUrl="/login?intended=job_seeker"
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
          Don't have an account?
        </p>
        <button
          onClick={() => navigate('/job-seeker/sign-up')}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Create job seeker account
        </button>
      </div>
    </div>
  );
};

export default JobSeekerSignIn;
