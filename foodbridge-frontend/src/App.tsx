import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DonorLayout } from './layouts/DonorLayout';
import { NGOLayout } from './layouts/NGOLayout';
import { VolunteerLayout } from './layouts/VolunteerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { DonorRegisterPage } from './pages/DonorRegisterPage';
import { NGORegisterPage } from './pages/NGORegisterPage';
import { VolunteerRegisterPage } from './pages/VolunteerRegisterPage';
import { AdminAccessPage } from './pages/AdminAccessPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { OTPVerifyPage } from './pages/OTPVerifyPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { AuthSuccessPage } from './pages/AuthSuccessPage';

// Module 2 — Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { CreateDonation } from './pages/donor/CreateDonation';
import { MyDonations } from './pages/donor/MyDonations';
import { DonationDetails } from './pages/donor/DonationDetails';
import { EditDonation } from './pages/donor/EditDonation';
import { DonationHistoryPage } from './pages/donor/DonationHistoryPage';

// Module 3 & Module 4 — NGO Pages
import { NGODashboard } from './pages/ngo/NGODashboard';
import { NGOProfile } from './pages/ngo/NGOProfile';
import { EditNGOProfile } from './pages/ngo/EditNGOProfile';
import { FoodPreferences } from './pages/ngo/FoodPreferences';
import { CapacityManagement } from './pages/ngo/CapacityManagement';
import { Availability } from './pages/ngo/Availability';
import { LocationManagement } from './pages/ngo/LocationManagement';
import { Verification } from './pages/ngo/Verification';
import { MatchedDonations } from './pages/ngo/MatchedDonations';
import { MatchDetailsPage } from './pages/ngo/MatchDetailsPage';
import { NGODonationHistoryPage } from './pages/ngo/NGODonationHistoryPage';

// Module 7 — Volunteer & Delivery Management Pages
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import { VolunteerProfile } from './pages/volunteer/VolunteerProfile';
import { AvailableDeliveries } from './pages/volunteer/AvailableDeliveries';
import { DeliveryDetailsPage } from './pages/volunteer/DeliveryDetailsPage';
import { DeliveryHistory } from './pages/volunteer/DeliveryHistory';

// Module 8 — Notification & Settings Pages
import { NotificationCenterPage } from './pages/notifications/NotificationCenterPage';
import { NotificationSettingsPage } from './pages/notifications/NotificationSettingsPage';

// Module 9 — Maps & Delivery Tracking Page
import { DeliveryMapPage } from './pages/maps/DeliveryMapPage';

// Module 11 — Dedicated Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NGOManagement } from './pages/admin/NGOManagement';
import { VolunteerManagement } from './pages/admin/VolunteerManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { DonationMonitoring } from './pages/admin/DonationMonitoring';
import { MatchingMonitoring } from './pages/admin/MatchingMonitoring';
import { DeliveryMonitoring } from './pages/admin/DeliveryMonitoring';
import { ReportsManagement } from './pages/admin/ReportsManagement';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SystemSettings } from './pages/admin/SystemSettings';

// Helper component that selects the correct portal layout based on the logged-in user's role
const RoleAwareMapLayout: React.FC = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'VOLUNTEER':
      return <VolunteerLayout />;
    case 'NGO':
      return <NGOLayout />;
    case 'DONOR':
      return <DonorLayout />;
    case 'ADMIN':
      return <AdminLayout />;
    default:
      return <DashboardLayout />;
  }
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Main Public Website Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            {/* Split Screen Public Auth Layout */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RoleSelectionPage />} />
              <Route path="/register/donor" element={<DonorRegisterPage />} />
              <Route path="/register/ngo" element={<NGORegisterPage />} />
              <Route path="/register/volunteer" element={<VolunteerRegisterPage />} />
              <Route path="/register/admin" element={<AdminAccessPage />} />
              <Route path="/verify" element={<OTPVerifyPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Dedicated Admin Portal Login (Separate Route) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Profile Completion Page */}
            <Route
              path="/profile/setup"
              element={
                <ProtectedRoute>
                  <ProfileSetupPage />
                </ProtectedRoute>
              }
            />

            {/* Auth Success Redirect Page */}
            <Route
              path="/auth-success"
              element={
                <ProtectedRoute>
                  <AuthSuccessPage />
                </ProtectedRoute>
              }
            />

            {/* Module 2 — Authenticated Donor Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <DonorLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/donor/dashboard" element={<DonorDashboard />} />
              <Route path="/dashboard/donor" element={<DonorDashboard />} />
              <Route path="/donor/donations" element={<MyDonations />} />
              <Route path="/donor/donations/create" element={<CreateDonation />} />
              <Route path="/donor/donations/:id" element={<DonationDetails />} />
              <Route path="/donor/donations/:id/edit" element={<EditDonation />} />
              <Route path="/donor/deliveries/:id/map" element={<DeliveryMapPage />} />
              <Route path="/donor/history" element={<DonationHistoryPage />} />
            </Route>

            {/* Module 3 & Module 4 — Authenticated NGO Management & Matching Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['NGO']}>
                  <NGOLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/ngo/dashboard" element={<NGODashboard />} />
              <Route path="/dashboard/ngo" element={<NGODashboard />} />
              <Route path="/ngo/matches" element={<MatchedDonations />} />
              <Route path="/ngo/matches/:matchId" element={<MatchDetailsPage />} />
              <Route path="/ngo/profile" element={<NGOProfile />} />
              <Route path="/ngo/profile/edit" element={<EditNGOProfile />} />
              <Route path="/ngo/food-preferences" element={<FoodPreferences />} />
              <Route path="/ngo/capacity" element={<CapacityManagement />} />
              <Route path="/ngo/availability" element={<Availability />} />
              <Route path="/ngo/location" element={<LocationManagement />} />
              <Route path="/ngo/verification" element={<Verification />} />
              <Route path="/ngo/deliveries/:id/map" element={<DeliveryMapPage />} />
              <Route path="/ngo/history" element={<NGODonationHistoryPage />} />
            </Route>

            {/* Module 7 — Authenticated Volunteer & Delivery Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['VOLUNTEER']}>
                  <VolunteerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
              <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
              <Route path="/volunteer/deliveries" element={<AvailableDeliveries />} />
              <Route path="/volunteer/deliveries/:id" element={<DeliveryDetailsPage />} />
              <Route path="/volunteer/deliveries/:id/map" element={<DeliveryMapPage />} />
              <Route path="/volunteer/profile" element={<VolunteerProfile />} />
              <Route path="/volunteer/history" element={<DeliveryHistory />} />
            </Route>

            {/* Universal Notification Pages */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN']}>
                  <RoleAwareMapLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/notifications" element={<NotificationCenterPage />} />
              <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
            </Route>

            {/* Universal Interactive Delivery Map Route (Role-Aware) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN']}>
                  <RoleAwareMapLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/deliveries/:id/map" element={<DeliveryMapPage />} />
            </Route>

            {/* Module 11 — Dedicated Separate Admin Portal Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/ngos" element={<NGOManagement />} />
              <Route path="/admin/volunteers" element={<VolunteerManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/donations" element={<DonationMonitoring />} />
              <Route path="/admin/matches" element={<MatchingMonitoring />} />
              <Route path="/admin/deliveries" element={<DeliveryMonitoring />} />
              <Route path="/admin/reports" element={<ReportsManagement />} />
              <Route path="/admin/issues" element={<ReportsManagement />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
            </Route>

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
