import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token || '')
        .maybeSingle();

      if (fetchError || !data) {
        setError('Invalid or expired invitation link.');
        setLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired.');
        setLoading(false);
        return;
      }

      if (data.invite_status === 'accepted') {
        setError('This invitation has already been used.');
        setLoading(false);
        return;
      }

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

    if (formData.password.length < 8) {
      toast({ variant: 'destructive', title: 'Password must be at least 8 characters' });
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

        await supabase
          .from('invitations')
          .update({ invite_status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('id', invitation.id);

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

      // If email confirmation is required, session will be null
      if (!authData.session) {
        toast({
          title: '✅ Account created!',
          description: 'Please check your email to confirm your account before logging in.',
        });
        await supabase.from('invitations').update({ invite_status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitation.id);
        navigate(`/login?email=${encodeURIComponent(invitation.email)}`);
        return;
      }

      // Update invitation status
      await supabase
        .from('invitations')
        .update({ invite_status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

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
    viewer: 'Viewer'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <Card className="w-full max-w-md shadow-card-hover">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">AuditEase AI</span>
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
