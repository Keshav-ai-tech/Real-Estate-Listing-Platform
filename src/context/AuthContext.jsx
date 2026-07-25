import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = ({ user, token: authToken }) => {
    const finalToken = authToken || `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const finalUser = user || { name: 'User', email: 'user@example.com', role: 'buyer' };

    localStorage.setItem('token', finalToken);
    localStorage.setItem('authToken', finalToken);
    localStorage.setItem('user', JSON.stringify(finalUser));
    localStorage.setItem('isLoggedIn', 'true');

    setToken(finalToken);
    setCurrentUser(finalUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setToken(null);
    setCurrentUser(null);
  };

  const updateUser = (updatedFields) => {
    setCurrentUser(prev => {
      const newObj = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newObj));
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
