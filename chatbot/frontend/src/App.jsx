import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import ChatApp from './components/ChatApp';

function AppContent() {
  const { authStep, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="fullscreen-loader">
        <div className="fullscreen-loader-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontFamily: 'var(--font-sans)' }}>
          Restoring session...
        </p>
      </div>
    );
  }

  switch (authStep) {
    case 'login':
      return <Login />;
    case 'register':
      return <Register />;
    case 'verify':
      return <VerifyEmail />;
    case 'app':
      return <ChatApp />;
    default:
      return <Login />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
