import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, setAuthStep } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <p className="auth-subtitle">Create a new account to get started</p>
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
              id="register-name"
              type="text"
              className="input-field"
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
            <label htmlFor="register-name" className="input-label">Full Name</label>
          </div>

          <div className="input-group">
            <input
              id="register-email"
              type="email"
              className="input-field"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <label htmlFor="register-email" className="input-label">Email Address</label>
          </div>

          <div className="input-group">
            <input
              id="register-password"
              type="password"
              className="input-field"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <label htmlFor="register-password" className="input-label">Password (Min 6 chars)</label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <button 
            type="button" 
            className="auth-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setAuthStep('login')}
            disabled={loading}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
