// contexts/AuthContext.tsx
// Global authentication state for the JanmaSethu website

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { registerUser, loginUser, RegisterUserData, LoginResponse } from '@/utils/api';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: string;
  preferred_language?: string;
  gender?: string;
  location?: string;
  user_relation?: string;
  profile_picture?: string;
  auth_provider?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userId: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  loginWithGoogle: (googleToken: string) => Promise<{ is_new_user: boolean; user: AuthUser }>;
  register: (data: RegisterUserData) => Promise<{ is_new_user: boolean; user: AuthUser }>;
  logout: () => void;
}

// ── Storage Keys ───────────────────────────────────────────────────────────────
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const LEGACY_USER_ID = 'userId';       // keep in sync for SakhiTry.tsx
const LEGACY_USERNAME = 'userName';

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const persistSession = (authUser: AuthUser, token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    // Keep legacy keys in sync for SakhiTry.tsx / JourneyContext
    localStorage.setItem(LEGACY_USER_ID, authUser.user_id);
    localStorage.setItem(LEGACY_USERNAME, authUser.name || authUser.email);
    setUser(authUser);
  };

  /** After login/register, sync any locally-saved journey to the backend */
  const syncOfflineJourney = (userId: string) => {
    try {
      const stored = localStorage.getItem('janmasethu_journey');
      if (!stored) return;
      const journey = JSON.parse(stored);
      if (!journey?.stage) return;

      import('../utils/api').then(({ saveUserJourney }) => {
        let dateType = 'UNKNOWN';
        if (journey.stage === 'TTC') dateType = 'CYCLE_START';
        if (journey.stage === 'PREGNANT') dateType = 'LMP';
        if (journey.stage === 'PARENT') dateType = 'BIRTH_DATE';
        saveUserJourney({ user_id: userId, stage: journey.stage, date: journey.date, date_type: dateType })
          .catch(() => {/* silent */ });
      });
    } catch { /* silent */ }
  };

  /** After login/register, flush offline tool usage to the backend */
  const syncOfflineToolUsage = async (userId: string) => {
    try {
      const raw = localStorage.getItem('tool_usage_offline');
      if (!raw) return;
      const entries: Array<{ tool_name: string; tool_data: object }> = JSON.parse(raw);

      const { API_BASE_URL } = await import('../utils/api');
      for (const entry of entries) {
        try {
          await fetch(`${API_BASE_URL}/user/tool-usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, ...entry }),
          });
        } catch { /* silent */ }
      }
      localStorage.removeItem('tool_usage_offline');
    } catch { /* silent */ }
  };

  // ── Auth actions ────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await loginUser({ email, password });
    persistSession(response.user as AuthUser, response.access_token || '');
    syncOfflineJourney(response.user_id);
    syncOfflineToolUsage(response.user_id);
    return response;
  };

  const loginWithGoogle = async (googleToken: string) => {
    const { API_BASE_URL } = await import('../utils/api');
    const resp = await fetch(`${API_BASE_URL}/user/google-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ google_token: googleToken }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || 'Google sign-in failed');

    persistSession(data.user as AuthUser, data.access_token || '');
    syncOfflineJourney(data.user_id);
    syncOfflineToolUsage(data.user_id);
    return { is_new_user: data.is_new_user, user: data.user as AuthUser };
  };

  const register = async (data: RegisterUserData) => {
    const response = await registerUser(data);
    const userId = (response as any).user_id || (response.user as AuthUser).user_id;
    persistSession(response.user as AuthUser, (response as any).access_token || '');
    if (userId) {
      syncOfflineJourney(userId);
      syncOfflineToolUsage(userId);
    }
    return { is_new_user: true, user: response.user as AuthUser };
  };

  const logout = () => {
    // Invalidate the session in the database (fire-and-forget)
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      fetch('/api/proxy/user/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token }),
      }).catch(() => { }); // Don't block logout if API fails
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(LEGACY_USER_ID);
    localStorage.removeItem(LEGACY_USERNAME);
    localStorage.removeItem('userRelationship');
    localStorage.removeItem('userPreferences');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userId: user?.user_id ?? null,
      isLoggedIn: !!user,
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
