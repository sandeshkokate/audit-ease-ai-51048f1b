import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PlatformAdminLayout from "@/components/layout/PlatformAdminLayout";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import PlatformDashboard from "./pages/platform-admin/Dashboard";
import Tenants from "./pages/platform-admin/Tenants";
import UsersPage from "./pages/platform-admin/UsersPage";
import Reports from "./pages/platform-admin/Reports";
import SettingsPage from "./pages/platform-admin/SettingsPage";
import ActivityLogs from "./pages/platform-admin/ActivityLogs";
import FeatureFlags from "./pages/platform-admin/FeatureFlags";
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
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="feature-flags" element={<FeatureFlags />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
