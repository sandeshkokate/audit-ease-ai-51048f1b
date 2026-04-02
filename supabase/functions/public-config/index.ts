import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/json',
    },
    status,
  });

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = Deno.env.get('SUPABASE_URL')?.trim();
  const publishableKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')?.trim();

  if (!url) {
    return jsonResponse({ error: 'SUPABASE_URL is not configured.' }, 500);
  }

  if (!publishableKey) {
    return jsonResponse({ error: 'SUPABASE_PUBLISHABLE_KEY is not configured.' }, 500);
  }

  if (!publishableKey.startsWith('sb_publishable_')) {
    return jsonResponse(
      { error: 'SUPABASE_PUBLISHABLE_KEY must use the new sb_publishable_ format.' },
      500
    );
  }

  return jsonResponse({ url, publishableKey }, 200);
});