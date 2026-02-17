import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import HelpWidget from "@/components/shared/HelpWidget";
import PlatformAdminLayout from "@/components/layout/PlatformAdminLayout";
import TenantAdminLayout from "@/components/layout/TenantAdminLayout";
import AccountantLayout from "@/components/layout/AccountantLayout";
import ViewerLayout from "@/components/layout/ViewerLayout";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
// Signup removed — redirects to /contact
import ForgotPassword from "./pages/auth/ForgotPassword";
// Platform Admin
import PlatformDashboard from "./pages/platform-admin/Dashboard";
import Tenants from "./pages/platform-admin/Tenants";
import UsersPage from "./pages/platform-admin/UsersPage";
import PlatformReports from "./pages/platform-admin/Reports";
import PlatformSettings from "./pages/platform-admin/SettingsPage";
import ActivityLogs from "./pages/platform-admin/ActivityLogs";
import FeatureFlags from "./pages/platform-admin/FeatureFlags";
// Tenant Admin
import TenantDashboard from "./pages/tenant-admin/Dashboard";
import UploadCSV from "./pages/tenant-admin/UploadCSV";
import AuditLogs from "./pages/tenant-admin/AuditLogs";
import Disputes from "./pages/tenant-admin/Disputes";
import Recoveries from "./pages/tenant-admin/Recoveries";
import Invoices from "./pages/tenant-admin/Invoices";
import TenantReports from "./pages/tenant-admin/TenantReports";
import Team from "./pages/tenant-admin/Team";
import TenantSettings from "./pages/tenant-admin/TenantSettings";
// Accountant
import AccountantDashboard from "./pages/accountant/Dashboard";
import AccountantInvoices from "./pages/accountant/Invoices";
import AccountantReports from "./pages/accountant/Reports";
// Viewer
import ViewerDashboard from "./pages/viewer/Dashboard";
import ViewerReports from "./pages/viewer/Reports";
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/contact" element={<Suspense fallback={null}><Contact /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={null}><About /></Suspense>} />
              <Route path="/privacy" element={<Suspense fallback={null}><Privacy /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Navigate to="/contact" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Platform Admin Routes */}
              <Route path="/platform-admin" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<PlatformDashboard />} />
                <Route path="tenants" element={<Tenants />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="reports" element={<PlatformReports />} />
                <Route path="settings" element={<PlatformSettings />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="feature-flags" element={<FeatureFlags />} />
              </Route>

              {/* Tenant Admin Routes */}
              <Route path="/tenant-admin" element={
                <ProtectedRoute allowedRoles={['tenant_admin']}>
                  <TenantAdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<TenantDashboard />} />
                <Route path="upload" element={<UploadCSV />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="disputes" element={<Disputes />} />
                <Route path="recoveries" element={<Recoveries />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="reports" element={<TenantReports />} />
                <Route path="team" element={<Team />} />
                <Route path="settings" element={<TenantSettings />} />
              </Route>

              {/* Accountant Routes */}
              <Route path="/accountant" element={
                <ProtectedRoute allowedRoles={['accountant']}>
                  <AccountantLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<AccountantDashboard />} />
                <Route path="invoices" element={<AccountantInvoices />} />
                <Route path="reports" element={<AccountantReports />} />
              </Route>

              {/* Viewer Routes */}
              <Route path="/viewer" element={
                <ProtectedRoute allowedRoles={['viewer']}>
                  <ViewerLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<ViewerDashboard />} />
                <Route path="reports" element={<ViewerReports />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <HelpWidget />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
