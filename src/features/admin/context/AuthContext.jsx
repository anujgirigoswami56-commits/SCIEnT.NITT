import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        if (token === 'dev-mock-admin-token-scient') {
          // Invalidate legacy dev-mock token and force fresh real authentication
          localStorage.removeItem('adminToken');
          setToken(null);
          setAdmin(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        try {
          const response = await axios.get(`${API_BASE}/api/admin/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAdmin(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token validation failed", error);
          logout();
        }
      }
      setLoading(false);
    };
    
    validateToken();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE}/api/admin/login`, { username, password });
      const { token: newToken, admin: adminData } = response.data;
      
      localStorage.setItem('adminToken', newToken);
      setToken(newToken);
      setAdmin(adminData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      // In development mode, allow fallback login if server/database is offline
      if (
        process.env.NODE_ENV === 'development' &&
        username.trim().toLowerCase() === 'admin' &&
        (password === 'admin123' || password === 'admin')
      ) {
        const devToken = 'dev-mock-admin-token-scient';
        const devAdmin = { id: 'dev-admin-id', username: 'admin', role: 'admin' };
        localStorage.setItem('adminToken', devToken);
        setToken(devToken);
        setAdmin(devAdmin);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please check credentials or start backend.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, loading, login, logout, API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
