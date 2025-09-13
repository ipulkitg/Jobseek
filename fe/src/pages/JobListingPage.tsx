import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  locationState: string;
  locationCity: string;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
  employer: {
    companyName: string;
  };
  category: {
    name: string;
  };
  locationStateRef: {
    name: string;
  };
}

interface JobCategory {
  id: string;
  name: string;
}

interface USState {
  id: string;
  name: string;
  abbreviation: string;
}

const JobListingPage: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [states, setStates] = useState<USState[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set()); // Track applied job IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Application modal state

  // Define callback functions first
  const loadJobs = useCallback(async () => {
    console.log('🔄 loadJobs: Starting...');
    try {
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedState) params.append('state_id', selectedState);
      if (selectedCity) params.append('city', selectedCity);
      if (salaryMin) params.append('salary_min', salaryMin);
      if (salaryMax) params.append('salary_max', salaryMax);

      params.append('limit', '20');
      params.append('offset', '0');

      console.log('🔄 loadJobs: Making API call with params:', params.toString());
      const response = await api.get(`/jobs?${params.toString()}`);
      console.log('🔄 loadJobs: API response received, jobs count:', response?.length || 0);
      setJobs(response);
      console.log('🔄 loadJobs: Jobs set successfully');
    } catch (err) {
      console.error('❌ loadJobs: Error loading jobs:', err);
      setError('Failed to load jobs');
    }
  }, [searchTerm, selectedCategory, selectedState, selectedCity, salaryMin, salaryMax]);

  const loadAppliedJobs = useCallback(async () => {
    if (!isSignedIn || !isLoaded) {
      return;
    }

    try {
      const response = await api.get('/jobs/applied-jobs');
      const appliedJobIds = response as string[];

      // Only update if we got data from API
      if (appliedJobIds && appliedJobIds.length > 0) {
        const appliedSet = new Set(appliedJobIds);
        setAppliedJobs(appliedSet);
        // Also store in localStorage as backup
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobIds));
      }
    } catch (err) {
      console.error('Failed to load applied jobs from API, keeping current state');
      // Don't override localStorage data if API fails
    }
  }, [isSignedIn, isLoaded]);

  const loadInitialData = useCallback(async () => {
    console.log('🔄 loadInitialData: Starting...');
    try {
      console.log('🔄 loadInitialData: Loading categories and states...');
      const [categoriesRes, statesRes] = await Promise.all([
        api.get('/jobs/categories'),
        api.get('/jobs/states')
      ]);

      console.log('🔄 loadInitialData: Setting categories and states...');
      setCategories(categoriesRes.data);
      setStates(statesRes.data);

      console.log('🔄 loadInitialData: Loading jobs...');
      await loadJobs();

      // Only load applied jobs for signed-in users
      if (isSignedIn) {
        console.log('🔄 loadInitialData: User is signed in, loading applied jobs...');
        await loadAppliedJobs();
      } else {
        console.log('🔄 loadInitialData: User not signed in, skipping applied jobs');
        setAppliedJobs(new Set()); // Clear applied jobs for unsigned users
      }

      console.log('🔄 loadInitialData: All data loaded successfully');
    } catch (err) {
      console.error('❌ loadInitialData: Error loading initial data:', err);
      setError('Failed to load initial data');
    } finally {
      console.log('🔄 loadInitialData: Setting loading to false');
      setLoading(false);
    }
  }, [loadJobs, loadAppliedJobs, isSignedIn]);

  // Load applied jobs from localStorage immediately (only for signed-in users)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Load from localStorage first for immediate UI update
      const localAppliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]') as string[];
      const appliedSet = new Set(localAppliedJobs);
      setAppliedJobs(appliedSet);

      // If no applied jobs from localStorage, try loading from API
      if (appliedSet.size === 0) {
        loadAppliedJobs();
      }
    } else if (isLoaded && !isSignedIn) {
      // Clear applied jobs for unsigned users
      setAppliedJobs(new Set());
    }
  }, [isLoaded, isSignedIn]);

  // Load initial data
  useEffect(() => {
    console.log('🔄 useEffect for loadInitialData triggered:', { isLoaded, isSignedIn });
    if (isLoaded) {
      console.log('🔄 useEffect: Calling loadInitialData...');
      loadInitialData();
    } else {
      console.log('🔄 useEffect: Not calling loadInitialData yet (isLoaded:', isLoaded, ', isSignedIn:', isSignedIn, ')');
    }
  }, [isLoaded, loadInitialData]);

  // Load jobs when filters change
  useEffect(() => {
    if (isLoaded) {
      loadJobs();
    }
  }, [isLoaded, loadJobs, searchTerm, selectedCategory, selectedState, selectedCity, salaryMin, salaryMax]);

  // Refresh applied jobs when navigating back from successful application
  useEffect(() => {
    const state = location.state as { applicationSubmitted?: boolean };
    if (state?.applicationSubmitted && isLoaded && isSignedIn) {
      // Reload from localStorage first (immediate update)
      const localAppliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]') as string[];
      const appliedSet = new Set(localAppliedJobs);
      setAppliedJobs(appliedSet);

      // Then try to sync with API
      loadAppliedJobs();

      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isLoaded, isSignedIn, loadAppliedJobs]);



  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedState('');
    setSelectedCity('');
    setSalaryMin('');
    setSalaryMax('');
  };

  const handleApplyClick = (e: React.MouseEvent, job: JobPosting) => {
    e.stopPropagation();
    if (!appliedJobs.has(job.id)) {
      navigate(`/apply/${job.id}`);
    }
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleViewDetailsClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    navigate(`/jobs/${jobId}`);
  };


  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (!min) return `Up to $${max?.toLocaleString()}`;
    if (!max) return `$${min?.toLocaleString()}+`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px'
      }}>
        Loading jobs...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: 'red'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Search and Filter Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search jobs by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '12px 20px',
                backgroundColor: showFilters ? '#3b82f6' : 'white',
                color: showFilters ? 'white' : '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity(''); // Reset city when state changes
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                City
              </label>
              <input
                type="text"
                placeholder="Enter city name"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Min Salary
              </label>
              <input
                type="number"
                placeholder="Min salary"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Max Salary
              </label>
              <input
                type="number"
                placeholder="Max salary"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        )}

        {/* Clear Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </span>
          <button
            onClick={clearFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>


      {/* Job Listings */}
      <div style={{
        display: 'grid',
        gap: '20px'
      }}>
        {jobs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No jobs found</h3>
            <p style={{ color: '#9ca3af' }}>Try adjusting your search criteria</p>
          </div>
        ) : (
          jobs.map(job => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job.id)}
              style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #f3f4f6',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    lineHeight: '1.3'
                  }}>
                    {job.title}
                  </h3>

                  {/* Company and Category Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <p style={{
                      fontSize: '16px',
                      color: '#3b82f6',
                      margin: '0',
                      fontWeight: '600'
                    }}>
                      {job.employer?.companyName || 'Unknown Company'}
                    </p>
                    <span style={{
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid #bfdbfe'
                    }}>
                      {job.category?.name || 'Unknown Category'}
                    </span>
                  </div>

                  {/* Location and Salary Row */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#059669', fontSize: '16px' }}>📍</span>
                      <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                        {job.locationCity}, {job.locationStateRef?.name || 'Unknown State'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#dc2626', fontSize: '16px' }}>💰</span>
                      <span style={{ color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                  </div>

                  {/* Job Description */}
                  {job.description && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{
                        color: '#4b5563',
                        fontSize: '15px',
                        lineHeight: '1.5',
                        margin: '0',
                        display: '-webkit-box',
                        WebkitLineClamp: '3',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {job.description}
                      </p>
                    </div>
                  )}

                  {/* Requirements */}
                  {job.requirements && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 6px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Requirements
                      </h4>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        margin: '0',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {job.requirements}
                      </p>
                    </div>
                  )}

                </div>
                <span style={{
                  color: '#9ca3af',
                  fontSize: '14px'
                }}>
                  {formatDate(job.createdAt)}
                </span>
              </div>

              {/* Bottom Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '20px',
                borderTop: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {(() => {
                    const hasApplied = appliedJobs.has(job.id);
                    const isUnsignedUser = !isSignedIn;
                    const buttonText = isUnsignedUser ? 'Login to Apply' : (hasApplied ? 'Applied' : 'Apply Now');

                    console.log(`🔍 Job ${job.id}: isUnsignedUser=${isUnsignedUser}, hasApplied=${hasApplied}, buttonText="${buttonText}"`);

                    if (isUnsignedUser) {
                      // Unsigned user - redirect to login
                      return (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/job-seeker/sign-in');
                          }}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title={`Button for job ${job.id}: ${buttonText}`}
                        >
                          {buttonText}
                        </button>
                      );
                    } else {
                      // Signed in user - normal apply/applied logic
                      return (
                        <button
                          onClick={hasApplied ? undefined : (e) => handleApplyClick(e, job)}
                          disabled={hasApplied}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: hasApplied ? '#f3f4f6' : '#3b82f6',
                            color: hasApplied ? '#9ca3af' : 'white',
                            border: hasApplied ? '1px solid #d1d5db' : 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: hasApplied ? 'default' : 'pointer'
                          }}
                          title={`Button for job ${job.id}: ${buttonText}`}
                        >
                          {buttonText}
                        </button>
                      );
                    }
                  })()}
                  <button
                    onClick={(e) => handleViewDetailsClick(e, job.id)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'white',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    View Details
                  </button>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  fontWeight: '500'
                }}>
                  Posted {formatDate(job.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default JobListingPage;
