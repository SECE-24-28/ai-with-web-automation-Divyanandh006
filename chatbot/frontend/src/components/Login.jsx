import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, setAuthStep, setVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      // If error is related to email verification, set verification email for transition
      if (err.message.includes('verified') || err.message.includes('verification')) {
        setVerificationEmail(email);
        setAuthStep('verify');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper animated-fadeIn">
      <div className="auth-card animated-slideUp">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-dot" style={{ display: 'inline-block', marginRight: '8px' }}></span>
            AI Chatbot
          </div>
          <p className="auth-subtitle">Sign in to continue to your dashboard</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              id="login-email"
              type="email"
              className="input-field"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <label htmlFor="login-email" className="input-label">Email Address</label>
          </div>

          <div className="input-group">
            <input
              id="login-password"
              type="password"
              className="input-field"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <label htmlFor="login-password" className="input-label">Password</label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <button 
            type="button" 
            className="auth-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setAuthStep('register')}
            disabled={loading}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
