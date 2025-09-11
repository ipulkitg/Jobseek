import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '../hooks/useProfile';
import { api } from '../services/api';

const ProfileSetup: React.FC = () => {
  const { user } = useUser();
  const { createProfile, updateProfile, refreshProfile, profile } = useProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') as 'job_seeker' | 'employer' | null;
  const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employer'>(roleFromUrl || profile?.role || 'job_seeker');

  // Debug logging for role selection
  useEffect(() => {
    console.log('📋 ProfileSetup: Role from URL:', roleFromUrl);
    console.log('📋 ProfileSetup: Profile role:', profile?.role);
    console.log('📋 ProfileSetup: Selected role:', selectedRole);
  }, [roleFromUrl, profile?.role, selectedRole]);
  const isEditing = !!profile;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [states, setStates] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    locationState: '',
    locationCity: '',
    skills: [] as string[],
    resumeUrl: '',
    companyName: '',
    companyDescription: '',
  });

  // Load states
  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await api.get('/jobs/states');
        setStates(response);
      } catch (err) {
        console.error('Error loading states:', err);
      }
    };
    loadStates();
  }, []);

  // Pre-fill form data from existing profile or Clerk user
  useEffect(() => {
    console.log('📋 ProfileSetup: useEffect triggered', { profile, user });
    if (profile) {
      console.log('📋 ProfileSetup: Pre-filling with existing profile data:', profile);
      // Pre-fill with existing profile data
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        locationState: profile.locationState || '',
        locationCity: profile.locationCity || '',
        skills: profile.skills || [],
        resumeUrl: profile.resumeUrl || '',
        companyName: profile.companyName || '',
        companyDescription: profile.companyDescription || '',
      });
      setSelectedRole(profile.role);
    } else if (user) {
      console.log('📋 ProfileSetup: Pre-filling with Clerk user data:', user);
      // Pre-fill with Clerk user data
      setFormData(prev => ({
        ...prev,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'
      }));
    }
  }, [user, profile]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleCreateProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      
      if (selectedRole === 'employer' && !formData.companyName.trim()) {
        throw new Error('Company name is required for employers');
      }

      const profileData = {
        role: selectedRole,
        name: formData.name.trim(),
        email: user.emailAddresses?.[0]?.emailAddress || '',
        phone: formData.phone.trim() || undefined,
        locationState: formData.locationState || undefined,
        locationCity: formData.locationCity.trim() || undefined,
        ...(selectedRole === 'job_seeker' ? {
          skills: formData.skills.filter(skill => skill.trim() !== ''),
          resumeUrl: formData.resumeUrl.trim() || undefined,
        } : {
          companyName: formData.companyName.trim(),
          companyDescription: formData.companyDescription.trim() || undefined,
        })
      };

      console.log('📋 Profile creation attempt:', {
        isEditing,
        profileData,
        existingProfile: profile
      });

      if (isEditing) {
        // Update existing profile
        console.log('📝 Updating profile with data:', profileData);
        const updatedProfile = await updateProfile(profileData);
        console.log('📝 Profile updated successfully:', updatedProfile);
        // Refresh profile data to ensure UI is in sync
        await refreshProfile();
      } else {
        // Create new profile
        console.log('📋 Creating profile with data:', profileData);
        const newProfile = await createProfile(profileData);
        console.log('📋 Profile created successfully:', newProfile);
      }

      // Redirect to appropriate dashboard
      console.log('🔄 Redirecting to dashboard for role:', selectedRole);
      if (selectedRole === 'job_seeker') {
        navigate('/job-seeker');
      } else {
        navigate('/employer');
      }
    } catch (err: any) {
      console.error('❌ Profile creation/update error:', err);
      
      let errorMessage = err.message || `Failed to ${isEditing ? 'update' : 'create'} profile. Please try again.`;
      
      // Handle specific error cases
      if (err.message?.includes('HTTP 400')) {
        errorMessage = 'Invalid profile data. Please check all required fields.';
      } else if (err.message?.includes('HTTP 401')) {
        errorMessage = 'Authentication failed. Please sign in again.';
      } else if (err.message?.includes('HTTP 500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProfile = () => {
    console.log('⏭️ Skipping profile creation, navigating to dashboard for role:', selectedRole);
    // Allow user to proceed to a basic dashboard without creating profile
    if (selectedRole === 'job_seeker') {
      navigate('/job-seeker');
    } else {
      navigate('/employer');
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
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {isEditing ? 'Edit Your' : 'Create Your'} {selectedRole === 'job_seeker' ? 'Job Seeker' : 'Employer'} Profile
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            {selectedRole === 'job_seeker' 
              ? 'Tell us about yourself to help employers find you and match you with the right opportunities.'
              : 'Tell us about your company to start posting jobs and finding great talent.'
            }
          </p>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            marginBottom: '0'
          }}>
            You can always update this information later, or skip for now to get started.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleCreateProfile(); }}>
          {/* Basic Information Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '8px'
            }}>
              Basic Information
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {selectedRole === 'employer' ? 'Your Name' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={selectedRole === 'employer' ? 'John Smith' : 'Jane Doe'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* State */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  State
                </label>
                <select
                  name="locationState"
                  value={formData.locationState}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  <option value="">Select a state</option>
                  {states && states.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  City
                </label>
                <input
                  type="text"
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleInputChange}
                  placeholder="San Francisco"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Role-specific fields */}
          {selectedRole === 'job_seeker' ? (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '8px'
              }}>
                Professional Information
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Skills & Expertise
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills.join(', ')}
                  onChange={handleSkillsChange}
                  placeholder="e.g., JavaScript, React, Python, Project Management"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Separate multiple skills with commas
                </small>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Resume URL (Optional)
                </label>
                <input
                  type="url"
                  name="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/resume.pdf"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Link to your resume or portfolio
                </small>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '8px'
              }}>
                Company Information
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required={selectedRole === 'employer'}
                  placeholder="Acme Corporation"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Company Description
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about your company, what you do, and what makes you unique..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  This will help job seekers understand your company better
                </small>
              </div>
            </div>
          )}

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                <strong>Error:</strong> {error}
                <br />
                <small style={{ color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                  Please check the browser console for more details.
                </small>
              </div>
            )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: '1',
                padding: '16px 24px',
                backgroundColor: loading ? '#9ca3af' : (selectedRole === 'employer' ? '#10b981' : '#3b82f6'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = selectedRole === 'employer' ? '#059669' : '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = selectedRole === 'employer' ? '#10b981' : '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {loading 
                ? (isEditing ? 'Saving...' : 'Creating Profile...') 
                : (isEditing 
                    ? 'Save Changes' 
                    : (selectedRole === 'employer' 
                        ? 'Create Company Profile' 
                        : 'Create Job Seeker Profile'
                      )
                  )
              }
            </button>
            
            <button
              type="button"
              onClick={handleSkipProfile}
              disabled={loading}
              style={{
                flex: '1',
                padding: '16px 24px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Skip for Now
            </button>
          </div>
          </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
