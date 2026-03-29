import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch {
      // Show success regardless to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-card-hover border-border/50">
        <CardHeader className="items-center space-y-4 pb-2">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-button shrink-0">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              AuditEase <span className="text-gradient">AI</span>
            </span>
          </Link>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Forgot Password</h2>
                <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
              </Button>
              <p className="text-center">
                <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </Link>
              </p>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <MailCheck className="h-10 w-10 text-success animate-fade-in" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Check Your Email</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  If this email exists in our system, you'll receive a reset link shortly.
                </p>
              </div>
              <Link to="/login">
                <Button variant="hero" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
