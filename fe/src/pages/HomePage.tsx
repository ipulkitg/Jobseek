import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="header">
        <h1>Job Portal</h1>
        <p>Connecting Blue-Collar & White-Collar Workers with Employers</p>
      </header>
      
      <main className="main-content">
        <div className="cta-section">
          <h2>Find Your Next Opportunity</h2>
          <div className="cta-buttons">
            <Link to="/login?type=job_seeker" className="btn btn-primary">
              I'm Looking for Jobs
            </Link>
            <Link to="/login?type=employer" className="btn btn-secondary">
              I'm Hiring
            </Link>
          </div>
        </div>
        
        <div className="features">
          <div className="feature">
            <h3>For Job Seekers</h3>
            <p>Browse jobs, apply easily, track your applications</p>
          </div>
          <div className="feature">
            <h3>For Employers</h3>
            <p>Post jobs, manage applications, find the right talent</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
