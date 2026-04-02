import { logger } from '@/lib/logger';
import { resolveSupabaseUrl, getSupabasePublicConfig } from '@/lib/supabase-public-config';

const OPTIONAL_VARS = [
  'VITE_SENTRY_DSN',
  'VITE_RESEND_API_KEY',
] as const;

export function validateEnv(): void {
  if (!resolveSupabaseUrl()) {
    throw new Error(
      'Missing Supabase URL. Set VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_ID in your environment.'
    );
  }

  const { publishableKey } = getSupabasePublicConfig();
  if (!publishableKey) {
    throw new Error(
      'Missing Supabase key. Set VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY in your environment.'
    );
  }

  if (import.meta.env.DEV) {
    const missingOptional = OPTIONAL_VARS.filter(
      (key) => !import.meta.env[key]
    );
    if (missingOptional.length > 0) {
      logger.warn(
        `[env] Optional variables not set: ${missingOptional.join(', ')}`
      );
    }
  }
}
