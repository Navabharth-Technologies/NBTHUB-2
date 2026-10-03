import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';

export const AuthContext = (typeof window !== 'undefined' && window.__NBT_AUTH_CONTEXT__)
  ? window.__NBT_AUTH_CONTEXT__
  : createContext();

if (typeof window !== 'undefined' && !window.__NBT_AUTH_CONTEXT__) {
  window.__NBT_AUTH_CONTEXT__ = AuthContext;
}

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const adjustLoggedUser = (u) => {
    if (!u) return u;
    const email = String(u.email || u.email_id || '').toLowerCase().trim();
    if (email === 'raviaradhya46@gmail.com') {
      return {
        ...u,
        role: 'Human Resource',
        designation: 'Human Resource'
      };
    }
    return u;
  };

  const setUser = (val) => {
    setUserState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return adjustLoggedUser(next);
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      const parsed = adjustLoggedUser(JSON.parse(savedUser));
      setUserState({ ...parsed, token });
      // Fetch latest profile to ensure name/designation are up to date
      fetch(`${API_ENDPOINTS.PROFILE(parsed.email)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async (res) => {
          if (res.status === 401) {
            logout();
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && !data.error) {
            const updated = adjustLoggedUser({ ...parsed, ...data, token });
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
          }
        })
        .catch(() => { });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const userWithToken = adjustLoggedUser({ ...data.user, token: data.token });
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      let err = {};
      try { err = await res.json(); } catch (_) {}
      const msg = (err.message || '').toLowerCase();
      if (res.status === 401 || msg.includes('password') || msg.includes('incorrect') || msg.includes('wrong')) {
        return { success: false, errorCode: 'WRONG_PASSWORD', error: err.message || 'Incorrect password. Please try again.' };
      }
      if (res.status === 404 || msg.includes('not found') || msg.includes('no user') || msg.includes('email')) {
        return { success: false, errorCode: 'USER_NOT_FOUND', error: err.message || 'No account found with this email address.' };
      }
      if (res.status === 403) {
        return { success: false, errorCode: 'ACCOUNT_DISABLED', error: err.message || 'Your account has been disabled. Please contact the HR department for further assistance.' };
      }
      return { success: false, errorCode: 'SERVER_ERROR', error: err.message || 'Server error. Please try again later.' };
    } catch (e) {
      if (e instanceof TypeError && (e.message.includes('fetch') || e.message.includes('network') || e.message.includes('Failed'))) {
        return { success: false, errorCode: 'NO_INTERNET', error: 'No internet connection. Please check your network and try again.' };
      }
      return { success: false, errorCode: 'NO_INTERNET', error: 'Unable to reach the server. Please check your internet connection.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (field, value, localOnly = false) => {
    if (!user) return { success: false, error: 'User not logged in' };

    // If localOnly is true, bypass the network request and update context directly
    if (localOnly) {
      const updatedUser = adjustLoggedUser({ ...user, [field]: value });
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [field]: value,
          profile_picture: field === 'profile_pic' ? value : undefined,
          email: user.email,
          userId: user.id || user.userId
        })
      });
      if (res.ok) {
        const updatedUser = adjustLoggedUser({ ...user, [field]: value });
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, error: 'Failed to update' };
    } catch (e) {
      // Optimistic update for demo if offline
      const updatedUser = adjustLoggedUser({ ...user, [field]: value });
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
