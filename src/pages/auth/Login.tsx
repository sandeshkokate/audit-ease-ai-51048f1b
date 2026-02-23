import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types';

const ROLE_REDIRECTS: Record<UserRole, string> = {
  platform_admin: '/platform-admin/dashboard',
  tenant_admin: '/tenant-admin/dashboard',
  accountant: '/accountant/dashboard',
  viewer: '/viewer/dashboard',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      let authData: any = null;
      let lastAuthError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (!result.error) {
          authData = result.data;
          lastAuthError = null;
          break;
        }
        if (result.error.status && result.error.status >= 500 && attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          lastAuthError = result.error;
          continue;
        }
        throw result.error;
      }
      if (lastAuthError) throw lastAuthError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('No user returned from auth');

      const { data: rows, error: profileError } = await supabase
        .rpc('get_user_profile_for_login', { lookup_user_id: userId });

      if (profileError) {
        console.error('Profile RPC error:', profileError);
        await supabase.auth.signOut();
        throw new Error('Unable to load your profile. Please try again.');
      }

      const profile = rows?.[0] ?? null;

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('Account setup is incomplete. Please contact your administrator.');
      }

      if (profile.is_active === false) {
        await supabase.auth.signOut();
        throw new Error('Your account has been deactivated. Contact your administrator.');
      }

      supabase.rpc('update_last_login', { lookup_user_id: userId }).then(() => {});

      localStorage.setItem('session_start', Date.now().toString());

      const role = profile.role as UserRole;
      navigate(ROLE_REDIRECTS[role] || '/');

    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: err?.message || 'Invalid email or password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden">
      {/* Rich layered background */}
      <div className="pointer-events-none absolute inset-0 gradient-mesh" />
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-25" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[140px]" />

      <Card className="relative w-full max-w-md shadow-elevated border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="items-center space-y-4 pb-2">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-button transition-transform group-hover:scale-105">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              AuditEase <span className="text-gradient">AI</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="hero" className="w-full shadow-button" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/contact" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Contact Us
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
