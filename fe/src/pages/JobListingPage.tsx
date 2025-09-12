import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import JobApplicationModal from '../components/JobApplicationModal';

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
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Define callback functions first
  const loadJobs = useCallback(async () => {
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

      const response = await api.get(`/jobs?${params.toString()}`);
      setJobs(response);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Error loading jobs:', err);
    }
  }, [searchTerm, selectedCategory, selectedState, selectedCity, salaryMin, salaryMax]);

  const loadAppliedJobs = useCallback(async () => {
    if (!isSignedIn || !isLoaded) {
      console.log('👤 loadAppliedJobs: User not signed in or not loaded, skipping');
      return;
    }

    // Temporarily use localStorage as primary method while backend issues are resolved
    console.log('🔍 loadAppliedJobs: Loading applied jobs from localStorage (temporary workaround)');
    const storedApplied = localStorage.getItem('appliedJobs');
    if (storedApplied) {
      try {
        const parsed = JSON.parse(storedApplied);
        setAppliedJobs(new Set(parsed));
        console.log('✅ loadAppliedJobs: Loaded applied jobs from localStorage:', parsed);
      } catch (parseErr) {
        console.error('❌ loadAppliedJobs: Failed to parse stored applied jobs:', parseErr);
        setAppliedJobs(new Set()); // Reset to empty set on parse error
      }
    } else {
      console.log('🔍 loadAppliedJobs: No localStorage data, starting with empty applied jobs set');
      setAppliedJobs(new Set());
    }

    // TODO: Re-enable backend integration once endpoints are fixed
    // try {
    //   console.log('🔍 loadAppliedJobs: Fetching applied jobs from /jobs/applied-jobs...');
    //   const appliedJobIds = await api.get('/jobs/applied-jobs');
    //   console.log('✅ loadAppliedJobs: Loaded applied jobs from applied-jobs endpoint:', appliedJobIds);
    //   setAppliedJobs(new Set(appliedJobIds));
    // } catch (err) {
    //   console.error('❌ loadAppliedJobs: Backend endpoints still failing, using localStorage fallback');
    // }
  }, [isSignedIn, isLoaded]);

  const loadInitialData = useCallback(async () => {
    try {
      const [categoriesRes, statesRes] = await Promise.all([
        api.get('/jobs/categories'),
        api.get('/jobs/states')
      ]);
      
      setCategories(categoriesRes.data);
      setStates(statesRes.data);
      await Promise.all([
        loadJobs(),
        loadAppliedJobs()
      ]);
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadJobs, loadAppliedJobs]);

  // Load initial data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadInitialData();
    }
  }, [isLoaded, isSignedIn, loadInitialData]);

  // Load jobs when filters change
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadJobs();
    }
  }, [isLoaded, isSignedIn, loadJobs]);



  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedState('');
    setSelectedCity('');
    setSalaryMin('');
    setSalaryMax('');
  };

  const handleApplyClick = (e: React.MouseEvent, job: JobPosting) => {
    e.stopPropagation(); // Prevent triggering the job click event
    console.log('🔍 handleApplyClick: Clicked apply for job:', job.id);
    console.log('🔍 handleApplyClick: Applied jobs set:', Array.from(appliedJobs));
    console.log('🔍 handleApplyClick: Is job already applied?', appliedJobs.has(job.id));
    
    // Prevent applying if already applied
    if (appliedJobs.has(job.id)) {
      console.log('⚠️ handleApplyClick: User already applied to this job, preventing modal');
      return;
    }
    
    console.log('✅ handleApplyClick: Opening application modal');
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleJobClick = (jobId: string) => {
    console.log('🔍 handleJobClick: Navigating to job details:', jobId);
    navigate(`/jobs/${jobId}`);
  };

  const handleViewDetailsClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); // Prevent triggering the job click event
    console.log('🔍 handleViewDetailsClick: Navigating to job details:', jobId);
    navigate(`/jobs/${jobId}`);
  };

  const handleApplicationSuccess = () => {
    // Add the job to applied jobs set immediately for instant UI feedback
    if (selectedJob) {
      console.log('🎉 handleApplicationSuccess: Processing successful application for job:', selectedJob.id);
      
      const newAppliedJobs = new Set(appliedJobs).add(selectedJob.id);
      setAppliedJobs(newAppliedJobs);
      
      // Persist to localStorage - this is our primary storage for now
      localStorage.setItem('appliedJobs', JSON.stringify(Array.from(newAppliedJobs)));
      console.log('✅ handleApplicationSuccess: Updated state and persisted to localStorage');
      console.log('✅ Applied jobs now:', Array.from(newAppliedJobs));
      
      // Note: Backend sync will be re-enabled once endpoints are fixed
    } else {
      console.error('❌ handleApplicationSuccess: No selected job found!');
    }
    console.log('🎉 handleApplicationSuccess: Application submitted successfully');
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
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 8px 0'
                  }}>
                    {job.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#3b82f6',
                    margin: '0 0 8px 0',
                    fontWeight: '500'
                  }}>
                    {job.employer?.companyName || 'Unknown Company'}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {job.category?.name || 'Unknown Category'}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      📍 {job.locationCity}, {job.locationStateRef?.name || 'Unknown State'}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      💰 {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                  </div>
                </div>
                <span style={{
                  color: '#9ca3af',
                  fontSize: '14px'
                }}>
                  {formatDate(job.createdAt)}
                </span>
              </div>
              
              <p style={{
                color: '#4b5563',
                lineHeight: '1.6',
                marginBottom: '16px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {job.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(() => {
                    const isApplied = appliedJobs.has(job.id);
                    console.log(`🔍 Button render for job ${job.id}: isApplied=${isApplied}, appliedJobs size=${appliedJobs.size}`);
                    
                    return isApplied ? (
                      <button
                        disabled
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'not-allowed',
                          opacity: 0.8
                        }}
                      >
                        ✓ Applied
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleApplyClick(e, job)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Apply Now
                      </button>
                    );
                  })()}
                  <button
                    onClick={(e) => handleViewDetailsClick(e, job.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: '#3b82f6',
                      border: '1px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobListingPage;
