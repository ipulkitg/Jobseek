import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react';
import './App.css';

// Import pages and components
import HomePage from './pages/HomePage';
import ClerkLoginPage from './pages/ClerkLoginPage';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import ProfileSetup from './pages/ProfileSetup';
import ProfileView from './pages/ProfileView';
import AuthInitializer from './components/AuthInitializer';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

function App() {
  // Check if the key is missing or still has placeholder value
  if (!clerkPubKey || clerkPubKey === 'YOUR_PUBLISHABLE_KEY') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1>🔑 Clerk Configuration Required</h1>
        <p>Please set up your Clerk publishable key in the environment variables.</p>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px', 
          margin: '20px 0',
          fontFamily: 'monospace',
          textAlign: 'left'
        }}>
          <p><strong>Steps to fix:</strong></p>
          <ol>
            <li>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer">Clerk Dashboard</a></li>
            <li>Create a new application or select existing one</li>
            <li>Copy your Publishable Key</li>
            <li>Update the <code>.env</code> file:</li>
          </ol>
          <pre style={{ backgroundColor: '#e8e8e8', padding: '10px', borderRadius: '4px' }}>
{`REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here`}
          </pre>
          <p>Then restart the development server.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthInitializer />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<ClerkLoginPage />} />
            <Route path="/sign-in" element={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa'
              }}>
                <SignIn redirectUrl="/login" />
              </div>
            } />
            <Route path="/sign-up" element={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa'
              }}>
                <SignUp redirectUrl="/login" />
              </div>
            } />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/job-seeker" element={<JobSeekerDashboard />} />
            <Route path="/employer" element={<EmployerDashboard />} />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
