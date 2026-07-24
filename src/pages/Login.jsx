import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate auth by writing to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify({ name: 'Jane Doe', email: email, role: 'buyer' }));
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-offset)',
      padding: '40px 24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '48px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow)'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '36px',
          marginBottom: '8px',
          textAlign: 'center'
        }}>Welcome Back</h1>
        <p style={{
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '14px'
        }}>Enter your details to access your account</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>Password</label>
              <a href="#" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '50px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            Sign In
          </button>
        </form>

        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
