import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

// UI Components
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Pages
import Login from "@/pages/Login";
import AdminLogin from "./pages/AdminLogin"; // Asegúrate de que esta ruta sea correcta
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Appointments from "@/pages/Appointments";
import BookAppointment from "@/pages/BookAppointment";
import Profile from "@/pages/Profile";
import Services from "@/pages/Services";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import TestPage from "@/pages/TestPage";
import NotificationTest from "@/pages/NotificationTest";
import Businesses from "./pages/Businesses";
import Employees from "./pages/Employees";
import ScheduleManagement from "./pages/ScheduleManagement";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  {/* --- RUTAS PÚBLICAS --- */}
                  <Route path="/login" element={<Login />} />

                  <Route path="/admin/login" element={<AdminLogin />} />

                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* --- REDIRECCIÓN DE LA RUTA RAÍZ --- */}
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />

                  {/* --- RUTAS PROTEGIDAS --- */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Appointments />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Profile />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications-test"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <NotificationTest />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* --- RUTAS ESPECÍFICAS POR ROL --- */}
                  <Route
                    path="/book"
                    element={
                      <ProtectedRoute allowedRoles={["client"]}>
                        <Layout>
                          <BookAppointment />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/services"
                    element={
                      <ProtectedRoute
                        allowedRoles={["administrator", "superuser"]}
                      >
                        <Layout>
                          <Services />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/schedules"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          "employee",
                          "administrator",
                          "superuser",
                        ]}
                      >
                        <Layout>
                          <ScheduleManagement />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employees"
                    element={
                      <ProtectedRoute
                        allowedRoles={["administrator", "superuser"]}
                      >
                        <Layout>
                          <Employees />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/businesses"
                    element={
                      <ProtectedRoute allowedRoles={["superuser"]}>
                        <Layout>
                          <Businesses />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AppProvider>
        </AuthProvider>
        <ToastViewport />
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
