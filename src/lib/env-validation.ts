import { logger } from '@/lib/logger';
import { isLegacySupabaseKey, resolveSupabaseUrl } from '@/lib/supabase-public-config';
/**
 * Validates required environment variables at app startup.
 * Throws descriptive errors for missing config.
 */
const REQUIRED_URL_GROUP = ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_PROJECT_ID'] as const;

const OPTIONAL_VARS = [
  'VITE_SENTRY_DSN',
  'VITE_RESEND_API_KEY',
] as const;

export function validateEnv(): void {
  if (!resolveSupabaseUrl()) {
    throw new Error(
      `Missing required environment variables:\n  - ${REQUIRED_URL_GROUP.join(' or ')}\n\nSee .env.example for reference.`
    );
  }

  const publishableKey =
    import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '';

  if (import.meta.env.DEV) {
    if (!publishableKey) {
      logger.warn('[env] Supabase publishable key missing at build time; public-config fallback will be used.');
    } else if (isLegacySupabaseKey(publishableKey)) {
      logger.warn('[env] Legacy Supabase key detected at build time; public-config fallback will be used.');
    }

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
