import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          role: decoded.role,
          name: decoded.name
        });
      } catch (error) {
        console.error('Invalid Token:', error);
        // Optionally, handle invalid token (e.g., logout)
      }
    }
  }, []);

  // ... any login/logout functions ...

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}; 