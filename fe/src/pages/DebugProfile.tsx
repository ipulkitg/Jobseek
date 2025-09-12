import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

const DebugProfile: React.FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [backendProfile, setBackendProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  useAuth(); // Initialize backend session

  useEffect(() => {
    const checkProfile = async () => {
      if (isLoaded && isSignedIn) {
        try {
          console.log('🔍 DebugProfile: Checking backend profile...');
          const profile = await api.get('/auth/profile');
          setBackendProfile(profile);
          console.log('✅ DebugProfile: Backend profile:', profile);
        } catch (err: any) {
          setError(err.message);
          console.error('❌ DebugProfile: Backend profile error:', err);
        }
      }
    };

    checkProfile();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Not signed in</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Debug Profile Information</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Clerk User Info:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify({
            id: user?.id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            emailAddresses: user?.emailAddresses?.map(e => e.emailAddress),
            isSignedIn,
            isLoaded
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Backend Profile:</h3>
        {error ? (
          <div style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>
            Error: {error}
          </div>
        ) : (
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(backendProfile, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Cookies:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {document.cookie || 'No cookies'}
        </pre>
      </div>
    </div>
  );
};

export default DebugProfile;
