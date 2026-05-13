import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

import API_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('emp_token');
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/api/employees/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (err) {
          console.error('Invalid token', err);
          localStorage.removeItem('emp_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('emp_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('emp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
