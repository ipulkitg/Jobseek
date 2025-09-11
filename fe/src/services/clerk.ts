import { api } from './api';

export interface UserProfile {
  id: string;
  userId: string;
  role: 'job_seeker' | 'employer';
  name: string;
  email: string;
  phone?: string;
  locationState?: string;
  locationCity?: string;
  locationStateName?: string;
  skills?: string[];
  resumeUrl?: string;
  companyName?: string;
  companyDescription?: string;
  createdAt: string;
  updatedAt: string;
}


export const clerkAuthService = {
  // Create user profile after authentication
  async createProfile(profileData: {
    role: 'job_seeker' | 'employer';
    name: string;
    email: string;
    phone?: string;
    locationState?: string;
    locationCity?: string;
    skills?: string[];
    resumeUrl?: string;
    companyName?: string;
    companyDescription?: string;
  }) {
    console.log('✨ clerkAuthService.createProfile called with:', profileData);
    try {
      const response = await api.post('/auth/profile', profileData);
      console.log('✨ clerkAuthService.createProfile response:', response);
      return response;
    } catch (error) {
      console.error('✨ clerkAuthService.createProfile error:', error);
      console.error('✨ clerkAuthService.createProfile error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        profileData
      });
      throw error;
    }
  },

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    console.log('🔍 clerkAuthService.getProfile called');
    const response = await api.get('/auth/profile');
    console.log('🔍 clerkAuthService.getProfile response:', response);
    return response;
  },

  // Update user profile
  async updateProfile(profileData: Partial<UserProfile>) {
    console.log('🔄 clerkAuthService.updateProfile called with:', profileData);
    const response = await api.put('/auth/profile', profileData);
    console.log('🔄 clerkAuthService.updateProfile response:', response);
    return response;
  },
};
