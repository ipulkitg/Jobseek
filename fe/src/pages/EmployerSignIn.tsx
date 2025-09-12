import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';

const EmployerSignIn: React.FC = () => {
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
          Employer Sign In
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '0'
        }}>
          Access your employer dashboard to manage jobs and applications
        </p>
      </div>

      <SignIn 
        afterSignInUrl="/login?intended=employer"
        fallbackRedirectUrl="/login?intended=employer"
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
          Create employer account
        </button>
      </div>
    </div>
  );
};

export default EmployerSignIn;
