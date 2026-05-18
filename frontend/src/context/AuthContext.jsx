import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API_URL = 'http://localhost:8000'; // FastAPI backend base URL
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('neuroai_token') || null);
  const [loading, setLoading] = useState(true);

  // Set default authorization header if token exists
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/api/auth/profile');
        setUser(res.data);
      } catch (err) {
        console.error('Session restored profile fetch failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { access_token, role, name } = res.data;
      
      localStorage.setItem('neuroai_token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      const profileRes = await axios.get('/api/auth/profile');
      setUser(profileRes.data);
      return profileRes.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post('/api/auth/register', { name, email, password });
    } catch (err) {
      throw err.response?.data?.detail || 'Registration failed. Choose a different email address.';
    }
  };

  const logout = () => {
    localStorage.removeItem('neuroai_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider wrapper.');
  }
  return context;
};
