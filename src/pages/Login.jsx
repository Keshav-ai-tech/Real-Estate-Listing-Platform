import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get success message if redirected from registration or previous route
  const successMessage = location.state?.message || '';
  const fromPath = location.state?.from?.pathname || '';

  // Safely extract string message to prevent [object Object]
  const extractErrorString = (err, defaultMsg = 'Invalid email or password.') => {
    if (!err) return defaultMsg;
    if (typeof err === 'string') return err;
    if (err.response?.data) {
      const d = err.response.data;
      if (typeof d === 'string') return d;
      if (typeof d.error === 'string') return d.error;
      if (d.error && typeof d.error.message === 'string') return d.error.message;
      if (typeof d.message === 'string') return d.message;
    }
    if (err.message && typeof err.message === 'string' && err.message !== '[object Object]') {
      return err.message;
    }
    return defaultMsg;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      let token = null;
      let user = null;

      try {
        const response = await api.post('/api/auth/login', { 
          email: email.trim(), 
          password 
        });
        token = response.data?.token || response.data?.jwt;
        user = response.data?.user;
      } catch (apiErr) {
        // 401 indicates wrong password/email for an account in the database
        if (apiErr.response && apiErr.response.status === 401) {
          throw new Error('Invalid email or password. Please verify your credentials.');
        }

        // If backend returned an error (e.g. 500 DB connection, 404, or network timeout),
        // check the local demo accounts registry for accounts created in demo/offline mode
        console.warn('Backend API request failed or returned error, checking local demo registry:', apiErr.message);
        
        const registeredUsers = JSON.parse(localStorage.getItem('estate_registered_users') || '[]');
        const matched = registeredUsers.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
        
        if (matched) {
          if (matched.password && matched.password !== password) {
            throw new Error('Invalid email or password. Please verify your credentials.');
          }
          user = { ...matched };
          delete user.password;
          token = `jwt_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        } else {
          // If not in local demo registry either, show server error if relevant or fallback
          const serverMsg = extractErrorString(apiErr, '');
          if (apiErr.response && serverMsg && apiErr.response.status !== 404 && apiErr.response.status !== 502) {
            throw new Error(serverMsg);
          }
          throw new Error('Invalid email or password. Please check your credentials.');
        }
      }

      if (!user) {
        throw new Error('Login failed: user profile not found.');
      }

      // Store in AuthContext & LocalStorage with verified role
      login({ user, token });

      // Precise role-based redirect:
      // If user came from a specific page (e.g., detail page, favorites), respect it.
      // Otherwise:
      // - Agent account -> redirect directly to Agent Dashboard (/dashboard)
      // - Buyer account -> redirect to Home (/) or target path
      if (fromPath && fromPath !== '/login' && fromPath !== '/') {
        navigate(fromPath, { replace: true });
      } else if (user.role === 'agent') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err) {
      setErrorMessage(extractErrorString(err, 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      tagline="Welcome Back to Estate."
      title="Sign In to Your Account"
      subtitle="Enter your details below to access saved properties, inquiries, and market updates."
    >
      {/* Success banner if redirected from registration */}
      {successMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Inline Error Message */}
      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Email input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Email Address
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={18} style={{
              position: 'absolute',
              left: '14px',
              color: '#94a3b8'
            }} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: '1px solid var(--border, #e2e8f0)',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary, #c9a063)';
                e.target.style.boxShadow = '0 0 0 3px rgba(201, 160, 99, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border, #e2e8f0)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Password input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
              Password
            </label>
            <a href="#" onClick={(e) => e.preventDefault()} style={{
              fontSize: '12px',
              color: 'var(--primary, #c9a063)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Forgot password?
            </a>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '14px',
              color: '#94a3b8'
            }} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: '1px solid var(--border, #e2e8f0)',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary, #c9a063)';
                e.target.style.boxShadow = '0 0 0 3px rgba(201, 160, 99, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border, #e2e8f0)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Submit button with loading spinner */}
        <button 
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: 'var(--primary, #c9a063)',
            color: '#ffffff',
            padding: '14px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '15px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(201, 160, 99, 0.3)',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.8 : 1
          }}
          onMouseOver={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--primary-hover, #b38b4d)';
          }}
          onMouseOut={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--primary, #c9a063)';
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Signing In...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Switch to Register link */}
      <div style={{
        marginTop: '32px',
        paddingTop: '20px',
        borderTop: '1px solid #f1f5f9',
        textAlign: 'center',
        fontSize: '14px',
        color: 'var(--text-muted, #64748b)'
      }}>
        Don't have an account?{' '}
        <Link to="/register" style={{
          color: 'var(--primary, #c9a063)',
          fontWeight: 700,
          textDecoration: 'none'
        }}>
          Create an account
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthLayout>
  );
}
