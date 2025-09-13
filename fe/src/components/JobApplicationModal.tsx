import React, { useState } from 'react';
import { api } from '../services/api';

interface JobPosting {
  id: string;
  title: string;
  employer: {
    companyName: string;
  };
}

interface JobApplicationModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post(`/jobs/${job.id}/apply`, {
        cover_letter: coverLetter
      });

      onSuccess();
      onClose();
      setCoverLetter('');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit application';

      // If user already applied, show a better message and close modal
      if (errorMessage.includes('already applied')) {
        // If they already applied, treat it as a success for UI purposes
        onSuccess();
        onClose();
        setCoverLetter('');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setCoverLetter('');
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
        maxWidth: '600px',
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
              Apply for Position
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#3b82f6',
              margin: '0 0 4px 0',
              fontWeight: '500'
            }}>
              {job.title}
            </p>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0'
            }}>
              {job.employer?.companyName || 'Unknown Company'}
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
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Cover Letter *
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a cover letter explaining why you're interested in this position and how your skills match the requirements..."
              required
              rows={8}
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
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '8px 0 0 0'
            }}>
              A well-written cover letter can significantly improve your chances of getting an interview.
            </p>
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
              disabled={loading || !coverLetter.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: loading || !coverLetter.trim() ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading || !coverLetter.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;






