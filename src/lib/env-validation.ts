/**
 * Validates required environment variables at app startup.
 * Throws descriptive errors for missing config.
 */
const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
] as const;

const OPTIONAL_VARS = [
  'VITE_SENTRY_DSN',
  'VITE_RESEND_API_KEY',
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
