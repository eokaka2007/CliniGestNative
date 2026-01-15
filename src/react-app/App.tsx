import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import LoginPage from "@/react-app/pages/Login";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import ClinicsPage from "@/react-app/pages/Clinics";
import ClinicDetailPage from "@/react-app/pages/ClinicDetail";
import EquipmentPage from "@/react-app/pages/Equipment";
import ManualsPage from "@/react-app/pages/Manuals";
import ManualDetailPage from "@/react-app/pages/ManualDetail";
import RoutinesPage from "@/react-app/pages/Routines";
import WastePage from "@/react-app/pages/Waste";
import HealthPage from "@/react-app/pages/Health";
import PartnersPage from "@/react-app/pages/Partners";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinics"
            element={
              <ProtectedRoute>
                <ClinicsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinics/:id"
            element={
              <ProtectedRoute>
                <ClinicDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinics/:clinicId/equipment/:equipmentId"
            element={
              <ProtectedRoute>
                <EquipmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manuals"
            element={
              <ProtectedRoute>
                <ManualsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manuals/:id"
            element={
              <ProtectedRoute>
                <ManualDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routines"
            element={
              <ProtectedRoute>
                <RoutinesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waste"
            element={
              <ProtectedRoute>
                <WastePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health"
            element={
              <ProtectedRoute>
                <HealthPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partners"
            element={
              <ProtectedRoute>
                <PartnersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
