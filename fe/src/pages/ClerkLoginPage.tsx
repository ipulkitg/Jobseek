import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useEffect } from 'react';

const ClerkLoginPage: React.FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  // Initialize backend session via cookie when signed in
  useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  // Check if user is already signed in and has a profile
  useEffect(() => {
    if (isLoaded && isSignedIn && !profileLoading) {
      if (profile) {
        // User has a profile, redirect to appropriate dashboard
        if (profile.role === 'job_seeker') {
          navigate('/job-seeker');
        } else if (profile.role === 'employer') {
          navigate('/employer');
        }
      } else {
        // User is signed in but no profile, check for stored role from sign-up
        const storedRole = localStorage.getItem('signupRole');
        console.log('🔐 ClerkLoginPage: Stored role from sign-up:', storedRole);
        if (storedRole) {
          // Clear the stored role and redirect with it
          localStorage.removeItem('signupRole');
          console.log('🔐 ClerkLoginPage: Redirecting to profile setup with role:', storedRole);
          navigate(`/profile-setup?role=${storedRole}`);
        } else {
          // No stored role, redirect to profile setup (defaults to job_seeker)
          console.log('🔐 ClerkLoginPage: No stored role, redirecting to default profile setup');
          navigate('/profile-setup');
        }
      }
    }
  }, [isLoaded, isSignedIn, profileLoading, profile, navigate]);

  const handleContinueToPlatform = () => {
    if (isSignedIn) {
      // User is signed in but no profile, redirect to profile creation
      navigate('/profile-setup');
    } else {
      // User not signed in, redirect to sign in
      navigate('/sign-in');
    }
  };

  const handleCreateProfile = () => {
    if (isSignedIn) {
      // User is signed in, redirect to profile creation
      navigate('/profile-setup');
    } else {
      // User not signed in, redirect to sign up
      navigate('/sign-up');
    }
  };

  const handleCreateJobSeekerProfile = () => {
    console.log('🔐 ClerkLoginPage: Job seeker profile clicked, isSignedIn:', isSignedIn);
    if (isSignedIn) {
      navigate('/profile-setup?role=job_seeker');
    } else {
      // Store role for after sign-up
      localStorage.setItem('signupRole', 'job_seeker');
      console.log('🔐 ClerkLoginPage: Stored job_seeker role, navigating to sign-up');
      navigate('/sign-up');
    }
  };

  const handleCreateEmployerProfile = () => {
    console.log('🔐 ClerkLoginPage: Employer profile clicked, isSignedIn:', isSignedIn);
    if (isSignedIn) {
      navigate('/profile-setup?role=employer');
    } else {
      // Store role for after sign-up
      localStorage.setItem('signupRole', 'employer');
      console.log('🔐 ClerkLoginPage: Stored employer role, navigating to sign-up');
      navigate('/sign-up');
    }
  };

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
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '48px 32px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          Welcome to Job Portal
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '0 0 32px 0'
        }}>
          {isSignedIn 
            ? "Choose how you'd like to proceed:"
            : "Sign in to continue to your dashboard or create a detailed profile"
          }
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={handleContinueToPlatform}
            style={{
              padding: '16px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            {isSignedIn ? 'Continue to Dashboard' : 'Sign In & Continue'}
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCreateJobSeekerProfile}
              style={{
                flex: 1,
                padding: '16px 24px',
                backgroundColor: 'white',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {isSignedIn ? 'Job Seeker Profile' : 'Sign Up as Job Seeker'}
            </button>
            
            <button
              onClick={handleCreateEmployerProfile}
              style={{
                flex: 1,
                padding: '16px 24px',
                backgroundColor: 'white',
                color: '#10b981',
                border: '2px solid #10b981',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {isSignedIn ? 'Employer Profile' : 'Sign Up as Employer'}
            </button>
          </div>
        </div>

        {isSignedIn && (
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: '24px 0 0 0'
          }}>
            You can update your profile details later in your dashboard
          </p>
        )}
      </div>
    </div>
  );
};

export default ClerkLoginPage;
