import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      setProfileError(false);

      // Use SECURITY DEFINER RPC — bypasses ALL RLS, works for every role
      const { data: rows, error } = await supabase
        .rpc('get_user_profile_for_login', { lookup_user_id: userId });

      if (error) {
        console.error('Profile fetch error:', error.message);
        setProfileError(true);
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = rows?.[0] ?? null;

      if (!profile) {
        console.error('Profile not found for user:', userId);
        setProfileError(true);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(profile as User);
      setProfileError(false);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfileError(true);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Single source of truth: onAuthStateChange handles both initial and subsequent sessions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id);
        } else {
          setUser(null);
          setProfileError(false);
          setLoading(false);
        }
      }
    );

    // Safety timeout: if still loading after 10 seconds, unblock the UI
    const safetyTimer = setTimeout(() => {
      if (mounted) {
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

  // Session expiry check (24h max)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.expires_at) {
        const loginTime = localStorage.getItem('session_start');
        if (!loginTime) {
          localStorage.setItem('session_start', Date.now().toString());
        } else {
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
        }
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
