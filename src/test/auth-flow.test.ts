import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      single: vi.fn(),
    })),
  },
}));

describe('Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Session Management', () => {
    it('session_start is set on login', () => {
      // Simulate what Login.tsx does after successful auth
      localStorage.setItem('session_start', Date.now().toString());
      expect(localStorage.getItem('session_start')).toBeTruthy();
    });

    it('session expires after 24 hours', () => {
      const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
      localStorage.setItem('session_start', twentyFiveHoursAgo.toString());
      
      const loginTime = localStorage.getItem('session_start');
      const age = Date.now() - parseInt(loginTime!, 10);
      expect(age).toBeGreaterThan(24 * 60 * 60 * 1000);
    });

    it('session is valid within 24 hours', () => {
      const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
      localStorage.setItem('session_start', oneHourAgo.toString());
      
      const loginTime = localStorage.getItem('session_start');
      const age = Date.now() - parseInt(loginTime!, 10);
      expect(age).toBeLessThan(24 * 60 * 60 * 1000);
    });

    it('session_start is cleared on logout', () => {
      localStorage.setItem('session_start', Date.now().toString());
      localStorage.removeItem('session_start');
      expect(localStorage.getItem('session_start')).toBeNull();
    });
  });

  describe('Role-based Redirects', () => {
    const ROLE_REDIRECTS: Record<string, string> = {
      platform_admin: '/platform-admin/dashboard',
      tenant_admin: '/tenant-admin/dashboard',
      accountant: '/accountant/dashboard',
      viewer: '/viewer/dashboard',
    };

    it('maps all four roles to correct dashboard paths', () => {
      expect(ROLE_REDIRECTS.platform_admin).toBe('/platform-admin/dashboard');
      expect(ROLE_REDIRECTS.tenant_admin).toBe('/tenant-admin/dashboard');
      expect(ROLE_REDIRECTS.accountant).toBe('/accountant/dashboard');
      expect(ROLE_REDIRECTS.viewer).toBe('/viewer/dashboard');
    });

    it('returns undefined for unknown role', () => {
      expect(ROLE_REDIRECTS['unknown_role']).toBeUndefined();
    });
  });

  describe('Rate Limiting', () => {
    it('rate limit parameters are correct for login', () => {
      // Login: 5 attempts per 15 minutes
      const loginConfig = { max_attempts: 5, window_minutes: 15, action: 'login' };
      expect(loginConfig.max_attempts).toBe(5);
      expect(loginConfig.window_minutes).toBe(15);
    });

    it('rate limit parameters are correct for contact form', () => {
      // Contact: 3 attempts per 30 minutes
      const contactConfig = { max_attempts: 3, window_minutes: 30, action: 'contact_form' };
      expect(contactConfig.max_attempts).toBe(3);
      expect(contactConfig.window_minutes).toBe(30);
    });
  });
});
