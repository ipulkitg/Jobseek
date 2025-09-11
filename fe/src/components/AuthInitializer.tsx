import { useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { api } from '../services/api';

// Initialize session once when user signs in
export default function AuthInitializer() {
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();

  useEffect(() => {
    const setupAuth = async () => {
      console.log('🔐 AuthInitializer: isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);
      if (isLoaded && isSignedIn) {
        try {
          console.log('🔐 AuthInitializer: Getting Clerk token...');
          const token = await getToken();
          console.log('🔐 AuthInitializer: Token received, length:', token?.length);
          // Establish backend session (HttpOnly cookie)
          if (token) {
            console.log('🔐 AuthInitializer: Calling /auth/login...');
            const response = await api.post('/auth/login', { clerk_token: token });
            console.log('🔐 AuthInitializer: Login response:', response);
            console.log('✅ Session established successfully');
          }
        } catch (error) {
          console.error('❌ Failed to establish session:', error);
        }
      }
    };

    setupAuth();
  }, [getToken, isSignedIn, isLoaded]);

  return null;
}