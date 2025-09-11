import { useAuth as useClerkAuth } from '@clerk/clerk-react';

export const useAuth = () => {
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();

  return {
    isSignedIn,
    isLoaded,
    getToken
  };
};
