import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthErrorCallback } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authStep, setAuthStep] = useState('login'); // 'login' | 'register' | 'verify' | 'app'
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auto-logout helper
  const triggerLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setAuthStep('login');
  };

  useEffect(() => {
    // Setup 401 automatic logout interceptor
    setAuthErrorCallback(triggerLogout);

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setAuthStep('app');
      } catch (err) {
        triggerLogout();
      }
    }
    setIsCheckingAuth(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setAuthStep('app');
      return data;
    } catch (error) {
      // If the backend returns a 403 status indicating not verified
      if (error.message.includes('not verified') || error.message.includes('verification')) {
        setVerificationEmail(email);
        setAuthStep('verify');
      }
      throw error;
    }
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    setVerificationEmail(email);
    setAuthStep('verify');
    return data;
  };

  const verify = async (code) => {
    const data = await api.verify(verificationEmail, code);
    setAuthStep('login');
    return data;
  };

  const resendVerificationCode = async () => {
    if (!verificationEmail) {
      throw new Error('No email address is set for verification');
    }
    return await api.resendVerification(verificationEmail);
  };

  const logout = () => {
    triggerLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authStep,
        verificationEmail,
        isCheckingAuth,
        setAuthStep,
        setVerificationEmail,
        login,
        register,
        verify,
        resendVerificationCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
