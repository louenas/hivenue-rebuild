// frontend/rental-app/src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Ensure this is imported
import { jwtDecode } from 'jwt-decode'; // Updated import

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // Now works correctly
  const [authData, setAuthData] = useState({
    token: localStorage.getItem('token'),
    user: null,
  });

  useEffect(() => {
    const fetchUser = () => {
      if (authData.token) {
        try {
          const decoded = jwtDecode(authData.token); // Updated usage
          setAuthData((prev) => ({ ...prev, user: decoded }));
          // Optionally, fetch additional user details from the backend here
        } catch (err) {
          console.error('Invalid token:', err);
          logout(); // Automatically log out if token is invalid
        }
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, [authData.token]);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    setAuthData({ token, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthData({ token: null, user: null });
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};