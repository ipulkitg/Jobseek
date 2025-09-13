import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

const ClerkLoginPage: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { profile, loading: profileLoading, hasCompleteProfile } = useProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get intended role from URL parameters
  const intendedRole = searchParams.get('intended') as 'employer' | 'job_seeker' | null;

  // Initialize backend session
  useAuth();

  // Auto-redirect logic for signed in users
  useEffect(() => {
    if (isLoaded && isSignedIn && !profileLoading) {
      if (hasCompleteProfile && profile) {
        // User has a complete profile, redirect to appropriate dashboard
        if (profile.role === 'job_seeker') {
          navigate('/job-seeker');
        } else if (profile.role === 'employer') {
          navigate('/employer');
        }
      } else {
        // User has incomplete or no profile, redirect to profile setup
        // Use intended role if provided, otherwise use existing profile role, or default to job_seeker
        const roleForSetup = intendedRole || profile?.role || 'job_seeker';
        navigate(`/profile-setup?role=${roleForSetup}`);
      }
    } else if (isLoaded && !isSignedIn) {
      // User not signed in, redirect to homepage
      navigate('/');
    }
  }, [isLoaded, isSignedIn, profileLoading, hasCompleteProfile, profile, navigate, intendedRole]);

  // Show loading while redirecting
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
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{
          fontSize: '18px',
          marginBottom: '8px'
        }}>
          Redirecting...
        </div>
        <div style={{
          fontSize: '14px'
        }}>
          Taking you to the right place
        </div>
      </div>
    </div>
  );
};

export default ClerkLoginPage;
