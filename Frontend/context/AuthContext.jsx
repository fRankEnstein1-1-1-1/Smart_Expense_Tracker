import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/Api';     // ← Import here

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [error, setError] = useState(null);

  // Initialize auth (Simplified)
  useEffect(() => {
    const initializeAuth = () => {
      if (token) {
        setToken(token);
        setUser({});           // Temporary - will improve later
      }
     
    };

    initializeAuth();
  }, []);

  // Register
  const register = async (name, email, password) => {
    
    setError(null);
    try {
      const res = await API.post('/auth/register', { name, email, password });
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    } 
  };

  // Login
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });

      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

 

  const value = {

    register,
    login,
    logout,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};