import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const { verify, resendVerificationCode, verificationEmail, setAuthStep } = useAuth();
  const [code, setCode] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Resend Timer State
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // References to input nodes
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus the first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Timer countdown hook
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    const val = element.value;
    if (isNaN(val)) return; // Allow numbers only

    const newCode = [...code];
    // Keep only the last character entered
    newCode[index] = val.substring(val.length - 1);
    setCode(newCode);

    // Auto-focus next input
    if (newCode[index] !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newCode = [...code];
      
      if (code[index] === '') {
        // If current is empty, focus previous and clear it
        if (index > 0) {
          newCode[index - 1] = '';
          setCode(newCode);
          inputRefs.current[index - 1].focus();
        }
      } else {
        // Clear current
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    
    // Check if it's a 6 digit number
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split('');
      setCode(pasteArray);
      // Focus last input
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await verify(fullCode);
      setSuccess('Verification successful! Redirecting to login...');
      setTimeout(() => {
        setAuthStep('login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 fields are filled
  useEffect(() => {
    if (code.every((val) => val !== '')) {
      handleSubmit();
    }
  }, [code]);

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resendVerificationCode();
      setSuccess('A new verification code has been generated.');
      setTimer(60);
      setCanResend(false);
      setCode(new Array(6).fill(''));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
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
            Verify Email
          </div>
          <p className="auth-subtitle" style={{ wordBreak: 'break-all' }}>
            We've sent a 6-digit code to <strong>{verificationEmail || 'your email'}</strong>
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{success}</span>
          </div>
        )}

        <div className="alert alert-info" style={{ padding: '8px 12px', fontSize: '12px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="9" x2="12.01" y2="9"></line></svg>
          <span><strong>Dev Tip:</strong> Check the backend server terminal console to retrieve the generated verification code!</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="verify-container" onPaste={handlePaste}>
            {code.map((data, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                className="verify-input"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={loading}
              />
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || code.some((val) => val === '')}>
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Code</span>
            )}
          </button>
        </form>

        <div className="resend-timer-text">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              className="auth-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
            >
              Resend Verification Code
            </button>
          ) : (
            <span>Resend code in {timer}s</span>
          )}
        </div>

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          Wrong email address?
          <button 
            type="button" 
            className="auth-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setAuthStep('register')}
            disabled={loading}
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
