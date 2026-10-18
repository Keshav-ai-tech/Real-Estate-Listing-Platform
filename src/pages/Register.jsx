import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Lock, Loader2, AlertCircle, UserCheck, Briefcase, Phone, Building2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer', // 'buyer' or 'agent'
    phone: '',
    agency: '',
    country: '',
    city: '',
    state: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    agency: false,
    country: false,
    city: false,
    state: false
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Client-side field validation helper
  const validate = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!data.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!data.password) {
      errors.password = 'Password is required.';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (data.role === 'agent') {
      if (!data.phone.trim()) {
        errors.phone = 'Phone number is required for agent accounts.';
      }
    }

    if (!data.country.trim()) {
      errors.country = 'Country is required.';
    }

    if (!data.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!data.state.trim()) {
      errors.state = 'State is required.';
    }

    return errors;
  };

  const errors = validate(formData);
  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setServerError('');

    if (hasErrors) {
      return;
    }

    setIsLoading(true);

    try {
      let token = null;
      let user = null;

      try {
        const response = await api.post('/api/auth/register', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role, // 'buyer' or 'agent'
          phone: formData.phone.trim(),
          agency: formData.agency.trim() || (formData.role === 'agent' ? 'Estate Luxury Group' : ''),
          country: formData.country.trim(),
          city: formData.city.trim(),
          state: formData.state.trim()
        });

        token = response.data?.token || response.data?.jwt;
        user = response.data?.user;
      } catch (apiErr) {
        if (apiErr.response) {
          const errMsg = apiErr.response.data?.error || apiErr.response.data?.message || 'Registration failed on server.';
          throw new Error(errMsg);
        }
        
        // Fallback for dev/client-side demo ONLY if backend server is unreachable
        console.warn('Backend register API unavailable, using client-side fallback:', apiErr.message);

        user = {
          id: `user_${Date.now()}`,
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role, // Preserve selected role
          phone: formData.phone.trim(),
          agency: formData.agency.trim() || (formData.role === 'agent' ? 'Estate Luxury Group' : ''),
          country: formData.country.trim(),
          city: formData.city.trim(),
          state: formData.state.trim()
        };
        token = `jwt_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Save into local demo users registry
        const registeredUsers = JSON.parse(localStorage.getItem('estate_registered_users') || '[]');
        const updated = registeredUsers.filter(u => u.email?.toLowerCase() !== user.email.toLowerCase());
        updated.push({
          ...user,
          password: formData.password
        });
        localStorage.setItem('estate_registered_users', JSON.stringify(updated));
      }

      // Automatically log the user in with their explicit registered role
      login({ user, token });

      // Role-specific immediate routing
      if (user.role === 'agent') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowError = (field) => {
    return (touched[field] || submitAttempted) && errors[field];
  };

  return (
    <AuthLayout
      tagline="Join Our Premium Real Estate Community."
      title="Create Your Account"
      subtitle="Find dream properties, connect with top industry agents, or list your portfolio."
    >
      {/* Global Server Error Banner */}
      {serverError && (
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
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Role Selector Toggle Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            I am joining as a
          </label>
          <div style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '50px',
            border: '1px solid var(--border, #e2e8f0)'
          }}>
            <button
              type="button"
              onClick={() => handleChange('role', 'buyer')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: formData.role === 'buyer' ? '#ffffff' : 'transparent',
                color: formData.role === 'buyer' ? 'var(--text-dark, #0f172a)' : 'var(--text-muted, #64748b)',
                boxShadow: formData.role === 'buyer' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <UserCheck size={16} style={{ color: formData.role === 'buyer' ? 'var(--primary, #c9a063)' : 'inherit' }} />
              Buyer / Renter
            </button>

            <button
              type="button"
              onClick={() => handleChange('role', 'agent')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: formData.role === 'agent' ? '#ffffff' : 'transparent',
                color: formData.role === 'agent' ? 'var(--text-dark, #0f172a)' : 'var(--text-muted, #64748b)',
                boxShadow: formData.role === 'agent' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Briefcase size={16} style={{ color: formData.role === 'agent' ? 'var(--primary, #c9a063)' : 'inherit' }} />
              Real Estate Agent
            </button>
          </div>
        </div>

        {/* Role Helper Banner */}
        <div style={{
          backgroundColor: formData.role === 'agent' ? 'rgba(201, 160, 99, 0.08)' : 'rgba(59, 130, 246, 0.06)',
          border: `1px solid ${formData.role === 'agent' ? 'rgba(201, 160, 99, 0.25)' : 'rgba(59, 130, 246, 0.2)'}`,
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          color: formData.role === 'agent' ? '#92400e' : '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {formData.role === 'agent' ? (
            <span>🏢 <strong>Agent Account:</strong> Sell properties, manage listings portfolio, and handle buyer inquiries.</span>
          ) : (
            <span>🏡 <strong>Buyer Account:</strong> Browse luxury listings, save favorites, and contact sellers.</span>
          )}
        </div>

        {/* Optional Agency Name & Phone for Agents */}
        {formData.role === 'agent' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
                Agency / Brokerage
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  value={formData.agency}
                  onChange={(e) => handleChange('agency', e.target.value)}
                  placeholder="e.g. Luxury Realty"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    border: '1px solid var(--border, #e2e8f0)',
                    outline: 'none',
                    fontSize: '14px',
                    backgroundColor: isLoading ? '#f8fafc' : '#ffffff'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
                Direct Phone <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="e.g. 555-0199"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    border: `1px solid ${shouldShowError('phone') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                    outline: 'none',
                    fontSize: '14px',
                    backgroundColor: isLoading ? '#f8fafc' : '#ffffff'
                  }}
                />
              </div>
              {shouldShowError('phone') && (
                <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                  {errors.phone}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Full Name field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Full Name
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <User size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="John Doe"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('name') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {shouldShowError('name') && (
            <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Email Address field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Email Address
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="name@domain.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('email') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {shouldShowError('email') && (
            <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Password field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Password
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="At least 6 characters"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('password') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {shouldShowError('password') && (
            <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>
              {errors.password}
            </span>
          )}
        </div>

        {/* Confirm Password field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
            <input 
              type="password" 
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Re-enter your password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('confirmPassword') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {shouldShowError('confirmPassword') && (
            <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px' }}>
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Location Fields (Country, State, City) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
              Country
            </label>
            <input 
              type="text" 
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              onBlur={() => handleBlur('country')}
              placeholder="e.g. India"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('country') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
            {shouldShowError('country') && (
              <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                {errors.country}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
              State
            </label>
            <input 
              type="text" 
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              onBlur={() => handleBlur('state')}
              placeholder="e.g. Delhi"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('state') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
            {shouldShowError('state') && (
              <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                {errors.state}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark, #0f172a)' }}>
              City
            </label>
            <input 
              type="text" 
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              onBlur={() => handleBlur('city')}
              placeholder="e.g. New Delhi"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1px solid ${shouldShowError('city') ? '#ef4444' : 'var(--border, #e2e8f0)'}`,
                outline: 'none',
                fontSize: '14px',
                backgroundColor: isLoading ? '#f8fafc' : '#ffffff',
                transition: 'border-color 0.2s ease'
              }}
            />
            {shouldShowError('city') && (
              <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                {errors.city}
              </span>
            )}
          </div>
        </div>

        {/* Submit button */}
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
            marginTop: '10px',
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
              <span>Creating Account...</span>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Switch to Login link */}
      <div style={{
        marginTop: '28px',
        paddingTop: '18px',
        borderTop: '1px solid #f1f5f9',
        textAlign: 'center',
        fontSize: '14px',
        color: 'var(--text-muted, #64748b)'
      }}>
        Already have an account?{' '}
        <Link to="/login" style={{
          color: 'var(--primary, #c9a063)',
          fontWeight: 700,
          textDecoration: 'none'
        }}>
          Sign In
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
