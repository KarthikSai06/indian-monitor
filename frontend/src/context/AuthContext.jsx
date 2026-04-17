import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const API_BASE = '/api/auth';

// ── User cache helpers — prevents flashing login page on reload ──────────────
function getCachedUser() {
  try {
    const raw = localStorage.getItem('bm_user_cache');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setCachedUser(user) {
  if (user) localStorage.setItem('bm_user_cache', JSON.stringify(user));
  else localStorage.removeItem('bm_user_cache');
}

// Helper: get stored auth token (set after cross-domain OAuth redirect)
function getStoredToken() {
  return localStorage.getItem('bm_token') || null;
}

// Helper: build fetch options with auth header if token exists
function authFetch(url, options = {}) {
  const token = getStoredToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { credentials: 'include', ...options, headers });
}

export function AuthProvider({ children }) {
  // Initialize user from cache immediately — no loading flash on reload
  const [user, setUser] = useState(() => getCachedUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  const checkAuth = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/me`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCachedUser(data.user);
      } else {
        setUser(null);
        setCachedUser(null);
        localStorage.removeItem('bm_token');
      }
    } catch {
      // Network error — keep cached user if available (offline resilience)
      // Don't clear the user; let them stay logged in if cached
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check for OAuth success redirect — read token from URL and store it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      // If backend sent the token in the URL (cross-domain OAuth fix), store it
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('bm_token', urlToken);
      }
      // Clean URL (remove ?auth=success&token=...)
      window.history.replaceState({}, '', window.location.pathname);
      checkAuth();
    }
  }, [checkAuth]);

  // Plan selection is handled by AppShell rendering PlanSelect when tierSetupDone is false

  const signup = async (name, email, password) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      // Store token if returned (for cross-domain auth)
      if (data.token) localStorage.setItem('bm_token', data.token);
      setUser(data.user);
      setCachedUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // Store token if returned (for cross-domain auth)
      if (data.token) localStorage.setItem('bm_token', data.token);
      setUser(data.user);
      setCachedUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authFetch(`${API_BASE}/logout`, { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('bm_token');
    setCachedUser(null);
    setUser(null);
  };

  const selectTier = async (tier) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/select-tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set plan');
      setUser(data.user);
      setCachedUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setUser(data.user);
      setCachedUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = () => {
    // Navigate directly to backend server — OAuth redirects don't work through Vite proxy
    const isProd = import.meta.env.PROD;
    const defaultBackend = isProd ? 'https://indian-monitor.onrender.com' : 'http://localhost:3001';
    const backendURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || defaultBackend;
    window.location.href = `${backendURL}/api/auth/google`;
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        selectTier,
        updateProfile,
        changePassword,
        loginWithGoogle,
        clearError,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;

