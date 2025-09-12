import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { clerkAuthService, UserProfile } from '../services/clerk';

export const useProfile = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      console.log('📋 useProfile: isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'user:', !!user);
      if (isLoaded && isSignedIn && user) {
        try {
          console.log('📋 useProfile: Calling getProfile...');
          const userProfile = await clerkAuthService.getProfile();
          console.log('📋 useProfile: Profile loaded:', userProfile);
          setProfile(userProfile);
        } catch (error) {
          console.log('📋 useProfile: No profile found for user:', error instanceof Error ? error.message : error);
          console.log('📋 useProfile: This is normal for new users who haven\'t created a profile yet');
          setProfile(null);
        }
      } else if (isLoaded && !isSignedIn) {
        console.log('📋 useProfile: User not signed in, clearing profile');
        setProfile(null);
      }
      setLoading(false);
    };

    loadProfile();
  }, [isLoaded, isSignedIn, user]);

  const createProfile = async (profileData: any) => {
    try {
      console.log('📋 useProfile: Creating profile with data:', profileData);
      const newProfile = await clerkAuthService.createProfile(profileData);
      console.log('📋 useProfile: Profile created successfully:', newProfile);
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('📋 useProfile: Error creating profile:', error);
      console.error('📋 useProfile: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        profileData
      });
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const updatedProfile = await clerkAuthService.updateProfile(profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const userProfile = await clerkAuthService.getProfile();
      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setProfile(null);
      throw error;
    }
  };

  const hasProfile = profile && profile.name && profile.name.trim() !== '';

  return {
    profile,
    loading,
    hasProfile,
    createProfile,
    updateProfile,
    refreshProfile,
  };
};

