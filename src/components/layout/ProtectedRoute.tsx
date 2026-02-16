import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
  const { user, loading, session } = useAuth();

  if (loading) return <LoadingSkeleton />;
  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    const dashboardUrl = ROLE_DASHBOARDS[user.role] || '/';
    return <Forbidden dashboardUrl={dashboardUrl} />;
  }

  return <>{children}</>;
}
