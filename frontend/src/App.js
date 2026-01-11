import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import DonorPortal from "./pages/DonorPortal";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Layout
import DashboardLayout from "./components/Layout/DashboardLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import RehabCenters from "./pages/admin/RehabCenters";
import AddictionTypes from "./pages/admin/AddictionTypes";
import DonationsManagement from "./pages/admin/DonationsManagement";
import PaymentSettings from "./pages/admin/PaymentSettings";
import SMTPSettings from "./pages/admin/SMTPSettings";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminProfile from "./pages/admin/AdminProfile";
import SiteSettings from "./pages/admin/SiteSettings";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import PatientRequests from "./pages/doctor/PatientRequests";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfile from "./pages/patient/PatientProfile";
import ChooseDoctor from "./pages/patient/ChooseDoctor";
import TreatmentStatus from "./pages/patient/TreatmentStatus";
import PatientDonations from "./pages/patient/PatientDonations";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/donate" element={<DonorPortal />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="rehab-centers" element={<RehabCenters />} />
            <Route path="addiction-types" element={<AddictionTypes />} />
            <Route path="donations" element={<DonationsManagement />} />
            <Route path="payment-settings" element={<PaymentSettings />} />
            <Route path="smtp-settings" element={<SMTPSettings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="site-settings" element={<SiteSettings />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor" element={<DashboardLayout allowedRoles={['doctor']} />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="requests" element={<PatientRequests />} />
            <Route path="notes" element={<PatientRequests />} />
          </Route>

          {/* Patient Routes */}
          <Route path="/patient" element={<DashboardLayout allowedRoles={['patient']} />}>
            <Route index element={<PatientDashboard />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="choose-doctor" element={<ChooseDoctor />} />
            <Route path="treatment" element={<TreatmentStatus />} />
            <Route path="donations" element={<PatientDonations />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
