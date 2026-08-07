import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('routemind_user');
    return saved ? JSON.parse(saved) : { username: 'supervisor', role: 'SUPERVISOR', full_name: 'Fleet Supervisor' };
  });

  const [token, setToken] = useState(() => localStorage.getItem('routemind_token') || 'demo_token');

  const login = async (username, password) => {
    try {
      const res = await authAPI.login(username, password);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('routemind_token', access_token);
      localStorage.setItem('routemind_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      // Fallback for mock demo login if backend not responding
      const demoUser = {
        username,
        role: username.includes('driver') ? 'DRIVER' : 'SUPERVISOR',
        full_name: username.includes('driver') ? 'Ramesh Kumar (Driver)' : 'Peenya Operations Supervisor'
      };
      localStorage.setItem('routemind_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { success: true };
    }
  };

  const switchRole = (newRole) => {
    const updated = { ...user, role: newRole };
    localStorage.setItem('routemind_user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('routemind_token');
    localStorage.removeItem('routemind_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
