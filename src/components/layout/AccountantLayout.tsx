import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, FileText, FileBarChart, LogOut, Menu, Shield, ChevronLeft, Info } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import HeaderActions from '@/components/shared/HeaderActions';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/accountant/dashboard', icon: BarChart3 },
  { title: 'Invoices', url: '/accountant/invoices', icon: FileText },
  { title: 'Reports', url: '/accountant/reports', icon: FileBarChart },
];

export default function AccountantLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const sidebarContent = (
    <>
      <button
        onClick={() => navigate('/')}
        className={cn('flex items-center gap-2.5 border-b border-sidebar-border px-4 h-16 w-full hover:bg-accent/5 transition-colors', collapsed && 'justify-center px-2')}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-button shrink-0">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-bold text-sidebar-foreground whitespace-nowrap tracking-tight">AuditEase</span>}
      </button>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.url} to={item.url} end={item.url.endsWith('dashboard')}
            className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground', collapsed && 'justify-center px-2')}
            activeClassName="bg-sidebar-accent text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-primary"
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button onClick={handleLogout} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-all hover:bg-destructive/15 hover:text-destructive', collapsed && 'justify-center px-2')}>
          <LogOut className="h-5 w-5 shrink-0" />{!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={cn('hidden md:flex flex-col sidebar-rich border-r border-sidebar-border transition-all duration-300 shrink-0', collapsed ? 'w-16' : 'w-60')}>{sidebarContent}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col sidebar-rich shadow-elevated">{sidebarContent}</aside>
        </div>
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 glass px-4 gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setCollapsed(!collapsed)}><ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} /></Button>
            <div>
              <h1 className="text-sm font-semibold text-foreground whitespace-nowrap">{user?.full_name || 'Accountant'}</h1>
              <p className="text-xs text-muted-foreground">Accountant</p>
            </div>
          </div>
          <HeaderActions />
        </header>
        <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-6">
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 mb-4 text-sm text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            You have view-only access. Contact your admin to request additional permissions.
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
