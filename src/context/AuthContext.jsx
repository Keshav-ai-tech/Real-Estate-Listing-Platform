import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep localStorage in sync if isLoggedIn flag was set elsewhere
    if (token) {
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      localStorage.removeItem('isLoggedIn');
    }
  }, [token]);

  // Synchronize authenticated user profile with backend on mount/token change
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    api.get('/api/auth/me')
      .then(res => {
        if (isMounted && res.data?.data) {
          const freshUser = res.data.data;
          setCurrentUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          localStorage.setItem('userRole', freshUser.role || 'buyer');
          localStorage.setItem('userName', freshUser.name || '');
          localStorage.setItem('userEmail', freshUser.email || '');
        }
      })
      .catch(err => {
        // Silently catch network errors in offline/dev mode
      });

    return () => { isMounted = false; };
  }, [token]);

  const login = ({ user, token: authToken }) => {
    const finalToken = authToken || `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const finalUser = user || { name: 'User', email: 'user@example.com', role: 'buyer' };

    localStorage.setItem('token', finalToken);
    localStorage.setItem('authToken', finalToken);
    localStorage.setItem('user', JSON.stringify(finalUser));
    localStorage.setItem('userRole', finalUser.role || 'buyer');
    localStorage.setItem('userName', finalUser.name || '');
    localStorage.setItem('userEmail', finalUser.email || '');
    localStorage.setItem('isLoggedIn', 'true');

    setToken(finalToken);
    setCurrentUser(finalUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');
    setToken(null);
    setCurrentUser(null);
  };

  const updateUser = (updatedFields) => {
    setCurrentUser(prev => {
      const newObj = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newObj));
      if (newObj.role) localStorage.setItem('userRole', newObj.role);
      if (newObj.name) localStorage.setItem('userName', newObj.name);
      if (newObj.email) localStorage.setItem('userEmail', newObj.email);
      return newObj;
    });
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!token && !!currentUser,
    login,
    logout,
    updateUser,
    loading,
    setLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
