import { logger } from '@/lib/logger';
/**
 * Validates required environment variables at app startup.
 * Throws descriptive errors for missing config.
 */
const REQUIRED_VAR_GROUPS = [
  ['SUPABASE_URL', 'VITE_SUPABASE_URL'],
  ['SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
] as const;

const OPTIONAL_VARS = [
  'VITE_SENTRY_DSN',
  'VITE_RESEND_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_VAR_GROUPS.filter(
    (keys) => !keys.some((key) => import.meta.env[key])
  ).map((keys) => keys.join(' or '));

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nSee .env.example for reference.`
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
