'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const storedUser = sessionStorage.getItem("user");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (!decoded.sub || !decoded.roles) {
          throw new Error('Invalid token structure');
        }

        // Use stored user data if available, otherwise decode from token
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({
            id: decoded.sub,
            roles: decoded.roles,
            full_name: decoded.full_name,
            email: decoded.email,
          });
        }

      } catch (err) {
        console.error("Invalid token:", err.message);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        document.cookie = 'access_token=; Max-Age=0; path=/;';
        setUser(null);
      }
    }

    setLoading(false);
  }, []);


  const login = async (email, password) => {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      if (!res.data?.access_token || !res.data?.user) {
        throw new Error('Invalid response from server');
      }

      const token = res.data.access_token;
      const user = res.data.user;

      // SessionStorage (tab-specific)
      sessionStorage.setItem("access_token", token);
      sessionStorage.setItem('user', JSON.stringify(user));

      // Cookie (middleware usage)
      document.cookie = `access_token=${token}; path=/;`;

      setUser(user);

      return user;
    } catch (err) {
      console.error("LOGIN FAILED:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const logout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem("user");
    sessionStorage.clear();
    document.cookie = 'access_token=; Max-Age=0; path=/;';
    setUser(null);

    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
