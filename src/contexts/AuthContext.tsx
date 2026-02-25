import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  tenantId: string | null;
  loading: boolean;
  profileError: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const fetchingRef = useRef(false);
  const loadedRef = useRef(false);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Prevent concurrent fetches that exhaust connection pool
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setProfileError(false);

      const { data: rows, error } = await supabase
        .rpc('get_user_profile_for_login', { lookup_user_id: userId });

      if (error) {
        setProfileError(true);
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = rows?.[0] ?? null;

      if (!profile) {
        setProfileError(true);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(profile as User);
      setProfileError(false);
      loadedRef.current = true;
    } catch {
      setProfileError(true);
      setUser(null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Single source of truth: onAuthStateChange handles both initial and subsequent sessions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession?.user) {
          // CRITICAL: Do NOT await inside onAuthStateChange — it blocks token refresh
          // and can deadlock after 2-3 logins, causing infinite spinner
          setTimeout(() => {
            if (mounted) fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setProfileError(false);
          setLoading(false);
        }
      }
    );

    // Safety timeout: if still loading after 10 seconds, unblock the UI
    const safetyTimer = setTimeout(() => {
      if (mounted && !loadedRef.current) {
        setLoading(false);
        setProfileError(true);
      }
    }, 10000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Session expiry check (24h max) — session_start is set in Login.tsx at login time
  useEffect(() => {
    const checkSession = async () => {
      const loginTime = localStorage.getItem('session_start');
      if (!loginTime) return; // No active session timestamp — skip
      const age = Date.now() - parseInt(loginTime, 10);
      if (age > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('session_start');
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        toast({
          title: 'Session Expired',
          description: 'Please log in again for security.',
        });
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [toast]);

  const signOut = async () => {
    localStorage.removeItem('session_start');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfileError(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role: user?.role ?? null,
        tenantId: user?.tenant_id ?? null,
        loading,
        profileError,
        signOut,
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
