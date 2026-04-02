export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const ENV_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const resolveSupabaseUrl = (): string =>
  ENV_URL || (PROJECT_ID ? `https://${PROJECT_ID}.supabase.co` : '');

export const getSupabasePublicConfig = (): SupabasePublicConfig => ({
  url: resolveSupabaseUrl(),
  publishableKey: ENV_KEY,
});

// No-op kept for backward compat with main.tsx bootstrap
export const primeSupabasePublicConfig = async (): Promise<SupabasePublicConfig> =>
  getSupabasePublicConfig();
