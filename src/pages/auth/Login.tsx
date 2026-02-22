import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('No user returned');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, tenant_id, is_active')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile query error:', profileError);
        await supabase.auth.signOut();
        throw new Error('Unable to load your profile. Please try again.');
      }

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('Account not found. Please contact your administrator.');
      }

      if (profile.is_active === false) {
        await supabase.auth.signOut();
        throw new Error('Your account has been deactivated. Contact your administrator.');
      }

      const role = profile.role as UserRole;
      navigate(ROLE_REDIRECTS[role] || '/');

      supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', userId).then(() => {});
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
      <Card className="w-full max-w-md shadow-card-hover border-border/50">
        <CardHeader className="items-center space-y-4 pb-2">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
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

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
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
