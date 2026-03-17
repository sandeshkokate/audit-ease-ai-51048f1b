import { lazy, Suspense, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import HelpWidget from "@/components/shared/HelpWidget";
import PlatformAdminLayout from "@/components/layout/PlatformAdminLayout";
import TenantAdminLayout from "@/components/layout/TenantAdminLayout";
import AccountantLayout from "@/components/layout/AccountantLayout";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AcceptInvite from "./pages/auth/AcceptInvite";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPostPage = lazy(() => import('./pages/BlogPost'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Platform Admin — lazy
const PlatformDashboard = lazy(() => import('./pages/platform-admin/Dashboard'));
const Tenants = lazy(() => import('./pages/platform-admin/Tenants'));
const UsersPage = lazy(() => import('./pages/platform-admin/UsersPage'));
const PlatformReports = lazy(() => import('./pages/platform-admin/Reports'));
const PlatformSettings = lazy(() => import('./pages/platform-admin/SettingsPage'));
const ActivityLogs = lazy(() => import('./pages/platform-admin/ActivityLogs'));
const FeatureFlags = lazy(() => import('./pages/platform-admin/FeatureFlags'));

// Tenant Admin — lazy
const TenantDashboard = lazy(() => import('./pages/tenant-admin/Dashboard'));
const UploadCSV = lazy(() => import('./pages/tenant-admin/UploadCSV'));
const UploadHistory = lazy(() => import('./pages/tenant-admin/UploadHistory'));
const AuditLogs = lazy(() => import('./pages/tenant-admin/AuditLogs'));
const Disputes = lazy(() => import('./pages/tenant-admin/Disputes'));
const Recoveries = lazy(() => import('./pages/tenant-admin/Recoveries'));
const Invoices = lazy(() => import('./pages/tenant-admin/Invoices'));
const TenantReports = lazy(() => import('./pages/tenant-admin/TenantReports'));
const Team = lazy(() => import('./pages/tenant-admin/Team'));
const TenantSettings = lazy(() => import('./pages/tenant-admin/TenantSettings'));

// Accountant — lazy
const AccountantDashboard = lazy(() => import('./pages/accountant/Dashboard'));
const AccountantInvoices = lazy(() => import('./pages/accountant/Invoices'));
const AccountantReports = lazy(() => import('./pages/accountant/Reports'));


const ROLE_DASHBOARDS: Record<string, string> = {
  platform_admin: '/platform-admin/dashboard',
  tenant_admin: '/tenant-admin/dashboard',
  accountant: '/accountant/dashboard',
};

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Landing />;
  if (user?.role && ROLE_DASHBOARDS[user.role]) return <Navigate to={ROLE_DASHBOARDS[user.role]} replace />;
  return <Landing />;
}

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  }>
    {children}
  </Suspense>
);

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA4_ID;
    if (!gaId) return;

    // Inject gtag.js script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Configure gtag
    const inline = document.createElement('script');
    inline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(inline);
  }, []);

  return (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public routes — no auth needed, load instantly */}
            <Route path="/contact" element={<LazyPage><Contact /></LazyPage>} />
            <Route path="/about" element={<LazyPage><About /></LazyPage>} />
            <Route path="/privacy" element={<LazyPage><Privacy /></LazyPage>} />
            <Route path="/terms" element={<LazyPage><Terms /></LazyPage>} />
            <Route path="/blog" element={<LazyPage><Blog /></LazyPage>} />
            <Route path="/blog/:slug" element={<LazyPage><BlogPostPage /></LazyPage>} />
            <Route path="/case-studies" element={<LazyPage><CaseStudies /></LazyPage>} />
            <Route path="/privacy-policy" element={<LazyPage><PrivacyPolicy /></LazyPage>} />
            <Route path="/terms-of-service" element={<LazyPage><TermsOfService /></LazyPage>} />

            {/* Auth-aware routes */}
            <Route path="/*" element={
              <AuthProvider>
                <AuthRoutes />
              </AuthProvider>
            } />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
  );
};

/** Routes that require AuthProvider context */
function AuthRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/contact" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/invite/:token" element={<AcceptInvite />} />

        {/* Platform Admin Routes */}
        <Route path="/platform-admin" element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <PlatformAdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><PlatformDashboard /></LazyPage>} />
          <Route path="tenants" element={<LazyPage><Tenants /></LazyPage>} />
          <Route path="users" element={<LazyPage><UsersPage /></LazyPage>} />
          <Route path="reports" element={<LazyPage><PlatformReports /></LazyPage>} />
          <Route path="settings" element={<LazyPage><PlatformSettings /></LazyPage>} />
          <Route path="activity-logs" element={<LazyPage><ActivityLogs /></LazyPage>} />
          <Route path="feature-flags" element={<LazyPage><FeatureFlags /></LazyPage>} />
        </Route>

        {/* Tenant Admin Routes */}
        <Route path="/tenant-admin" element={
          <ProtectedRoute allowedRoles={['tenant_admin']}>
            <TenantAdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><TenantDashboard /></LazyPage>} />
          <Route path="upload" element={<LazyPage><UploadCSV /></LazyPage>} />
          <Route path="upload-history" element={<LazyPage><UploadHistory /></LazyPage>} />
          <Route path="audit-logs" element={<LazyPage><AuditLogs /></LazyPage>} />
          <Route path="disputes" element={<LazyPage><Disputes /></LazyPage>} />
          <Route path="recoveries" element={<LazyPage><Recoveries /></LazyPage>} />
          <Route path="invoices" element={<LazyPage><Invoices /></LazyPage>} />
          <Route path="reports" element={<LazyPage><TenantReports /></LazyPage>} />
          <Route path="team" element={<LazyPage><Team /></LazyPage>} />
          <Route path="settings" element={<LazyPage><TenantSettings /></LazyPage>} />
        </Route>

        {/* Accountant Routes */}
        <Route path="/accountant" element={
          <ProtectedRoute allowedRoles={['accountant']}>
            <AccountantLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><AccountantDashboard /></LazyPage>} />
          <Route path="invoices" element={<LazyPage><AccountantInvoices /></LazyPage>} />
          <Route path="reports" element={<LazyPage><AccountantReports /></LazyPage>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <HelpWidget />
    </>
  );
}

export default App;
