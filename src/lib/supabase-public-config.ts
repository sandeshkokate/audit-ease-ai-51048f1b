export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

declare global {
  interface Window {
    __AUDITEASE_SUPABASE_CONFIG__?: SupabasePublicConfig;
  }
}

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const ENV_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  '';

export const isLegacySupabaseKey = (value: string | null | undefined): boolean =>
  typeof value === 'string' && value.startsWith('eyJ');

export const isModernSupabasePublishableKey = (
  value: string | null | undefined
): value is string => typeof value === 'string' && value.startsWith('sb_publishable_');

export const isSupabaseClientKey = (value: string | null | undefined): value is string =>
  isModernSupabasePublishableKey(value) || isLegacySupabaseKey(value);

export const resolveSupabaseUrl = (): string =>
  ENV_URL || (PROJECT_ID ? `https://${PROJECT_ID}.supabase.co` : '');

const readWindowConfig = (): SupabasePublicConfig | null => {
  if (typeof window === 'undefined') return null;
  return window.__AUDITEASE_SUPABASE_CONFIG__ ?? null;
};

const writeWindowConfig = (config: SupabasePublicConfig): SupabasePublicConfig => {
  if (typeof window !== 'undefined') {
    window.__AUDITEASE_SUPABASE_CONFIG__ = config;
  }

  return config;
};

export const getSupabasePublicConfig = (): SupabasePublicConfig => {
  const windowConfig = readWindowConfig();

  if (windowConfig?.url && isSupabaseClientKey(windowConfig.publishableKey)) {
    return windowConfig;
  }

  return {
    url: resolveSupabaseUrl(),
    publishableKey: ENV_PUBLISHABLE_KEY,
  };
};

export const primeSupabasePublicConfig = async (): Promise<SupabasePublicConfig> => {
  const url = resolveSupabaseUrl();

  if (!url) {
    throw new Error('Supabase URL is not configured.');
  }

  const envConfig: SupabasePublicConfig = {
    url,
    publishableKey: ENV_PUBLISHABLE_KEY,
  };

  if (isModernSupabasePublishableKey(envConfig.publishableKey)) {
    return writeWindowConfig(envConfig);
  }

  try {
    const response = await fetch(`${url}/functions/v1/public-config?ts=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = (await response.json()) as Partial<SupabasePublicConfig>;

      if (data.url && isSupabaseClientKey(data.publishableKey)) {
        return writeWindowConfig({
          url: data.url,
          publishableKey: data.publishableKey,
        });
      }
    }
  } catch {
    // Fall back to the build-time value below.
  }

  return writeWindowConfig(envConfig);
};
