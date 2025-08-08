import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

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
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Appointments from "@/pages/Appointments";
import BookAppointment from "@/pages/BookAppointment";
import Profile from "@/pages/Profile";
import Services from "@/pages/Services";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import Businesses from "./pages/Businesses";
import Employees from "./pages/Employees";
import ScheduleManagement from "./pages/ScheduleManagement";
import BusinessProfileSettings from "./pages/BusinessProfileSettings";
import PublicProfilePage from "./pages/PublicProfilePage";
import Availability from "./pages/AvailabilityPage";
import AiChatWidget from "./components/ai/AiChatWidget";

const queryClient = new QueryClient();

const ProtectedLayout = ({ allowedRoles }) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
};

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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/b/:slug" element={<PublicProfilePage />} />

                  {/* Rutas para todos los usuarios autenticados */}
                  <Route element={<ProtectedLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>

                  {/* Rutas solo para clientes */}
                  <Route
                    element={
                      <ProtectedLayout
                        allowedRoles={["client", "employee", "administrator"]}
                      />
                    }
                  >
                    <Route path="/book" element={<BookAppointment />} />
                  </Route>

                  {/* Rutas para empleados y superiores */}
                  <Route
                    element={
                      <ProtectedLayout
                        allowedRoles={[
                          "employee",
                          "administrator",
                          "superuser",
                        ]}
                      />
                    }
                  >
                    <Route path="/schedules" element={<ScheduleManagement />} />
                  </Route>

                  {/* Rutas para administradores y superuser */}
                  <Route
                    element={
                      <ProtectedLayout
                        allowedRoles={["administrator", "superuser"]}
                      />
                    }
                  >
                    <Route path="/services" element={<Services />} />
                    <Route path="/employees" element={<Employees />} />
                  </Route>
                  <Route
                    path="/availability"
                    element={<Availability />}
                  ></Route>
                  <Route
                    path="/business-settings"
                    element={
                      <ProtectedRoute
                        allowedRoles={["administrator", "superuser"]}
                      >
                        <BusinessProfileSettings />
                      </ProtectedRoute>
                    }
                  ></Route>

                  {/* Rutas solo para superusuarios */}
                  <Route
                    element={<ProtectedLayout allowedRoles={["superuser"]} />}
                  >
                    <Route path="/businesses" element={<Businesses />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AppProvider>
        </AuthProvider>
        <ToastViewport />
      </ToastProvider>
      <AiChatWidget />
    </QueryClientProvider>
  );
};

export default App;
