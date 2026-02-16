import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3, Upload, ScrollText, Mail, IndianRupee,
  FileText, FileBarChart, Users, Settings, LogOut,
  Bell, Menu, Shield, ChevronLeft,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/tenant-admin/dashboard', icon: BarChart3 },
  { title: 'Upload CSV', url: '/tenant-admin/upload', icon: Upload },
  { title: 'Audit Logs', url: '/tenant-admin/audit-logs', icon: ScrollText },
  { title: 'Disputes', url: '/tenant-admin/disputes', icon: Mail },
  { title: 'Recoveries', url: '/tenant-admin/recoveries', icon: IndianRupee },
  { title: 'Invoices', url: '/tenant-admin/invoices', icon: FileText },
  { title: 'Reports', url: '/tenant-admin/reports', icon: FileBarChart },
  { title: 'Team', url: '/tenant-admin/team', icon: Users },
  { title: 'Settings', url: '/tenant-admin/settings', icon: Settings },
];

export default function TenantAdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className={cn('flex items-center gap-2 border-b border-border px-4 h-16', collapsed && 'justify-center px-2')}>
        <Shield className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold text-foreground whitespace-nowrap">
            AuditEase <span className="text-gradient">AI</span>
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url.endsWith('dashboard')}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={cn('hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0', collapsed ? 'w-16' : 'w-60')}>
        {sidebarContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-card shadow-xl">{sidebarContent}</aside>
        </div>
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setCollapsed(!collapsed)}>
              <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
            </Button>
            <div>
              <h1 className="text-sm font-semibold text-foreground whitespace-nowrap">
                {user?.full_name || 'Tenant Admin'}
              </h1>
              <p className="text-xs text-muted-foreground">FastShip Logistics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user?.full_name?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
