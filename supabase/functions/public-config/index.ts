import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY');

  if (!url || !publishableKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase public config is not configured.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }

  return new Response(
    JSON.stringify({ url, publishableKey }),
    {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'application/json',
      },
      status: 200,
    }
  );
});