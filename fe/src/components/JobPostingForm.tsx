import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface JobCategory {
  id: string;
  name: string;
}

interface USState {
  id: string;
  name: string;
  abbreviation: string;
}

interface JobPostingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingJob?: {
    id: string;
    title: string;
    description: string;
    requirements: string;
    locationState: string;
    locationCity: string;
    salaryMin: number | null;
    salaryMax: number | null;
    categoryId: string;
  } | null;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingJob = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    locationState: '',
    locationCity: '',
    salaryMin: '',
    salaryMax: '',
    categoryId: ''
  });
  
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [states, setStates] = useState<USState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        description: editingJob.description,
        requirements: editingJob.requirements,
        locationState: editingJob.locationState,
        locationCity: editingJob.locationCity,
        salaryMin: editingJob.salaryMin?.toString() || '',
        salaryMax: editingJob.salaryMax?.toString() || '',
        categoryId: editingJob.categoryId
      });
    } else {
      setFormData({
        title: '',
        description: '',
        requirements: '',
        locationState: '',
        locationCity: '',
        salaryMin: '',
        salaryMax: '',
        categoryId: ''
      });
    }
  }, [editingJob]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, statesRes] = await Promise.all([
        api.get('/jobs/categories'),
        api.get('/jobs/states')
      ]);
      
      setCategories(categoriesRes);
      setStates(statesRes);
    } catch (err) {
      setError('Failed to load form data');
      console.error('Error loading form data:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location_state: formData.locationState,
        location_city: formData.locationCity,
        salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        category_id: formData.categoryId
      };

      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, jobData);
      } else {
        await api.post('/jobs/', jobData);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save job posting');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {editingJob ? 'Edit Job Posting' : 'Create Job Posting'}
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0'
            }}>
              {editingJob ? 'Update your job posting details' : 'Fill in the details for your new job posting'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#9ca3af',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '4px',
              opacity: loading ? 0.5 : 1
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Job Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Software Engineer"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>
                State *
              </label>
              <select
                name="locationState"
                value={formData.locationState}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                <option value="">Select a state</option>
                {states.map(state => (
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
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>
                City *
              </label>
              <input
                type="text"
                name="locationCity"
                value={formData.locationCity}
                onChange={handleInputChange}
                placeholder="e.g., San Francisco"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>

            {/* Salary Range */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Minimum Salary
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                placeholder="e.g., 80000"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Maximum Salary
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                placeholder="e.g., 120000"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>
          </div>

          {/* Job Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
              required
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Requirements */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Requirements *
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="List the required skills, experience, education, and qualifications..."
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.description || !formData.requirements || !formData.categoryId || !formData.locationState || !formData.locationCity}
              style={{
                padding: '12px 24px',
                backgroundColor: loading || !formData.title || !formData.description || !formData.requirements || !formData.categoryId || !formData.locationState || !formData.locationCity ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading || !formData.title || !formData.description || !formData.requirements || !formData.categoryId || !formData.locationState || !formData.locationCity ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              {loading ? (editingJob ? 'Updating...' : 'Creating...') : (editingJob ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;


