import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
 
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
 
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
 
  try {
    const { to, inviterName, roleLabel, inviteLink } = await req.json()
 
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_KEY) throw new Error('RESEND_API_KEY not configured')
 
    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;
        padding:32px 24px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb">
        <h2 style="color:#1a1a2e;margin:0 0 24px">
          Audit<span style="color:#6366f1">Ease</span>
        </h2>
        <h3 style="color:#111;margin:0 0 16px">You have been invited!</h3>
        <p style="color:#555;line-height:1.6;margin:0 0 12px">Hi,</p>
        <p style="color:#555;line-height:1.6;margin:0 0 12px">
          ${inviterName} has invited you to join their team on AuditEase 
          as <strong>${roleLabel}</strong>.
        </p>
        <p style="color:#555;line-height:1.6;margin:0 0 24px">
          Click the button below to accept the invitation and set your password.
        </p>
        <a href="${inviteLink}" 
          style="display:inline-block;background:#6366f1;color:#fff;
          padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
          Accept Invitation
        </a>
        <p style="color:#888;font-size:13px;margin:24px 0 8px">
          This invitation expires in 7 days.
        </p>
        <p style="color:#aaa;font-size:12px;margin:8px 0 0">
          Or copy this link: ${inviteLink}
        </p>
      </div>
    `
 
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AuditEase <noreply@auditeasetechnologies.com>',
        to,
        subject: `You are invited to join AuditEase as ${roleLabel}`,
        html: emailHtml,
      }),
    })
 
    const data = await response.json()
 
    return new Response(JSON.stringify({ success: response.ok, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.ok ? 200 : 400,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
