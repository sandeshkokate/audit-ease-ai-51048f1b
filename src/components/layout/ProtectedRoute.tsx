import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types';

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  platform_admin: '/platform-admin/dashboard',
  tenant_admin: '/tenant-admin/dashboard',
  accountant: '/accountant/dashboard',
  viewer: '/viewer/dashboard',
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Shield className="h-10 w-10 text-primary animate-pulse" />
        <div className="h-2 w-32 rounded-full bg-muted animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading your account...</p>
      </div>
    </div>
  );
}

function ProfileErrorScreen() {
  const handleRetry = () => window.location.reload();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Unable to Load Profile</h2>
        <p className="text-sm text-muted-foreground">
          We could not load your account details. This may be a temporary issue.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          <Button variant="hero" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-1" /> Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

function Forbidden({ dashboardUrl }: { dashboardUrl: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">403</h1>
        <p className="text-lg text-muted-foreground">You don't have permission to access this page.</p>
        <Link to={dashboardUrl}>
          <Button variant="hero" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, session, profileError } = useAuth();

  // Still loading — show spinner
  if (loading) return <LoadingSkeleton />;

  // No session — go to login
  if (!session) return <Navigate to="/login" replace />;

  // Session exists but profile failed to load — show error with retry
  if (profileError || !user) return <ProfileErrorScreen />;

  // Profile loaded but wrong role for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardUrl = ROLE_DASHBOARDS[user.role] || '/';
    return <Forbidden dashboardUrl={dashboardUrl} />;
  }

  return <>{children}</>;
}
