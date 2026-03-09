/**
 * Validates required environment variables at app startup.
 * Throws descriptive errors for missing config.
 */
const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

const OPTIONAL_VARS = [
  'VITE_N8N_WEBHOOK_CSV',
  'VITE_N8N_WEBHOOK_DISPUTES',
  'VITE_N8N_WEBHOOK_CONTACT',
  'VITE_N8N_WEBHOOK_RECOVERY',
  'VITE_N8N_WEBHOOK_INVOICE',
  'VITE_N8N_WEBHOOK_INVITE_EMAIL',
  'VITE_SENTRY_DSN',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_VARS.filter(
    (key) => !import.meta.env[key]
  );

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
      console.warn(
        `[env] Optional variables not set: ${missingOptional.join(', ')}`
      );
    }
  }
}
