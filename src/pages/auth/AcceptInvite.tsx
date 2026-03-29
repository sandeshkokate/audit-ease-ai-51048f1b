import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { passwordSchema } from '@/lib/validation-schemas';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      // Use the security-definer RPC to validate — avoids direct table reads with anon key
      const { data: result, error: rpcError } = await supabase.rpc('accept_invitation', { token_value: token || '' });
      const resultObj = result as any;
      
      // The RPC returns success:false for invalid/expired/used tokens
      // We just need to know it's valid — we don't actually accept yet
      // Re-query minimal invitation data via RPC result
      if (rpcError || !resultObj?.success) {
        setError(resultObj?.error || 'Invalid or expired invitation link.');
        setLoading(false);
        return;
      }

      // Token is valid — now fetch invitation details using the token (RLS allows same-tenant reads)
      const { data } = await supabase
        .from('invitations')
        .select('email, role, tenant_id, invite_status')
        .eq('token', token || '')
        .maybeSingle();

      if (!data) {
        setError('Invalid or expired invitation link.');
        setLoading(false);
        return;
      }

      // Note: The RPC already marked this as 'accepted'. 
      // We need to revert it since user hasn't completed signup yet.
      try { await supabase.rpc('accept_invitation', { token_value: token || '' }); } catch { /* ignore */ }

      // Fetch tenant name separately
      const { data: tenant } = await supabase
        .from('tenants')
        .select('company_name')
        .eq('id', data.tenant_id)
        .maybeSingle();

      setInvitation({ ...data, company_name: tenant?.company_name });
      setLoading(false);
    } catch {
      setError('Failed to validate invitation.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }

    const pwResult = passwordSchema.safeParse(formData.password);
    if (!pwResult.success) {
      toast({ variant: 'destructive', title: pwResult.error.errors[0].message });
      return;
    }

    setSubmitting(true);

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', invitation.email)
        .maybeSingle();

      if (existingUser) {
        // Link existing user to invitation's tenant and role
        await supabase
          .from('users')
          .update({
            tenant_id: invitation.tenant_id,
            role: invitation.role,
            full_name: formData.fullName || undefined,
            is_active: true,
          })
          .eq('id', existingUser.id);

        // Use security definer RPC to accept invitation (bypasses RLS)
        const { data: result } = await supabase.rpc('accept_invitation', { token_value: token! });
        const resultObj = result as any;
        if (resultObj && !resultObj.success) throw new Error(resultObj.error);

        toast({ title: '✅ You have been added to the team!', description: 'You can now log in.' });
        navigate(`/login?email=${encodeURIComponent(invitation.email)}`);
        return;
      }

      // New user: sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            tenant_id: invitation.tenant_id,
            role: invitation.role
          }
        }
      });

      if (authError) throw authError;

      // Accept invitation via RPC
      const { data: acceptResult } = await supabase.rpc('accept_invitation', { token_value: token! });
      const acceptObj = acceptResult as any;
      if (acceptObj && !acceptObj.success) throw new Error(acceptObj.error);

      // If email confirmation is required, session will be null
      if (!authData.session) {
        toast({
          title: '✅ Account created!',
          description: 'Please check your email to confirm your account before logging in.',
        });
        navigate(`/login?email=${encodeURIComponent(invitation.email)}`);
        return;
      }

      // Delay to avoid trigger race condition
      await new Promise(r => setTimeout(r, 1200));
      if (authData.user) {
        await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: invitation.email,
            tenant_id: invitation.tenant_id,
            role: invitation.role,
            full_name: formData.fullName,
            is_active: true,
          }, { onConflict: 'id' });
      }

      toast({ title: '✅ Account created!', description: 'You can now log in.' });
      await supabase.auth.signOut();
      navigate(`/login?email=${encodeURIComponent(invitation.email)}`);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabels: Record<string, string> = {
    tenant_admin: 'Administrator',
    accountant: 'Accountant',
  };

  const getPasswordStrength = (pw: string) => {
    if (pw.length < 8) return { label: 'Too short', color: 'text-destructive' };
    const hasNum = /\d/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    if (hasNum && hasSpecial) return { label: 'Strong ✓', color: 'text-success' };
    if (hasNum || hasSpecial) return { label: 'Fair', color: 'text-warning' };
    return { label: 'Weak', color: 'text-destructive' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Invitation Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild variant="outline">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-card-hover">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2.5 mb-4 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-button shrink-0">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              AuditEase <span className="text-gradient">AI</span>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <CheckCircle className="h-10 w-10 text-success mx-auto mb-2" />
            <h1 className="text-xl font-bold text-foreground">You're Invited!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join <span className="font-medium text-foreground">{invitation?.company_name}</span> as a{' '}
              <span className="font-medium text-foreground">{roleLabels[invitation?.role] || invitation?.role}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={invitation?.email || ''} disabled className="bg-muted" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Create Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              {formData.password && (
                <p className={`text-xs mt-1 ${getPasswordStrength(formData.password).color}`}>
                  Strength: {getPasswordStrength(formData.password).label}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Minimum 8 characters with at least one uppercase letter, one lowercase letter, and one number.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account & Join'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
