// src/pages/Login.jsx (o donde lo tengas)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ActionButton } from "@/components/ui/action-button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Icons
import { FiEye, FiEyeOff, FiUser, FiLock, FiLogIn } from "react-icons/fi";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // CAMBIO 1: Obtener `loginClient` en lugar del antiguo `login`.
  const { loginClient } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!userName || !password) {
      setError("Por favor, completa todos los campos");
      setIsLoading(false);
      return;
    }

    try {
      // CAMBIO 2: Llamar a la función `loginClient`.
      await loginClient(userName, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message ||
          "Credenciales inválidas. Por favor, verifica tu usuario y contraseña.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función de login rápido para cuentas demo (opcional, pero también actualizada)
  const quickLogin = async (userDemoName, userDemoPassword) => {
    setIsLoading(true);
    setError("");
    try {
      // También debe usar `loginClient`
      await loginClient(userDemoName, userDemoPassword);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión con la cuenta demo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-violet-600 rounded-full">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Turnify</h1>
          <p className="text-gray-600">Sistema de Gestión de Citas</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Nombre de Usuario" htmlFor="userName" required>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="pl-10"
                    placeholder="tu_nombre_de_usuario"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </FormField>

              <FormField label="Contraseña" htmlFor="password" required>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Tu contraseña"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </FormField>

              <ActionButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                loadingText="Iniciando sesión..."
                icon={FiLogIn}
              >
                Iniciar Sesión
              </ActionButton>
            </form>

            <div className="text-center">
              <Link
                to="/register"
                className="text-violet-600 hover:text-violet-700 text-sm"
              >
                ¿No tienes cuenta? Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Cuentas de Demostración</CardTitle>
            <CardDescription>
              Prueba la aplicación con diferentes roles de usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <ActionButton
                variant="outline"
                onClick={() => quickLogin("cliente_demo", "password123")}
                isLoading={isLoading}
                icon={FiUser}
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Cliente Demo</div>
                  <div className="text-xs text-gray-500">
                    Reservar citas y ver historial
                  </div>
                </div>
              </ActionButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
