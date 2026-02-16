import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PlatformAdminLayout from "@/components/layout/PlatformAdminLayout";
import TenantAdminLayout from "@/components/layout/TenantAdminLayout";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
