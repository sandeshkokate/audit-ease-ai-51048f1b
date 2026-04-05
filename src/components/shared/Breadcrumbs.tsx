import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routeNames: Record<string, string> = {
  'tenant-admin': 'Dashboard',
  'dashboard': 'Dashboard',
  'upload': 'Upload CSV',
  'audit-logs': 'Audit Logs',
  'disputes': 'Disputes',
  'recoveries': 'Recoveries',
  'invoices': 'Invoices',
  'reports': 'Reports',
  'team': 'Team',
  'settings': 'Settings',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link to="/" className="hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        const name = routeNames[segment] || segment;

        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{name}</span>
            ) : (
              <Link to={path} className="hover:text-foreground">{name}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
