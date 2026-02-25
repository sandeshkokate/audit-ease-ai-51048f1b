import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        </CardHeader>
        <CardContent>
          {!hasSession ? (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Invalid or Expired Link</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <Link to="/forgot-password">
                <Button variant="hero">Request New Link</Button>
              </Link>
            </div>
          ) : success ? (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success animate-fade-in" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Password Updated!</h2>
                <p className="text-sm text-muted-foreground">You can now log in with your new password.</p>
              </div>
              <Button variant="hero" onClick={handleGoToLogin}>Go to Login</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Set New Password</h2>
                <p className="text-sm text-muted-foreground">Enter your new password below.</p>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
