import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ActionButton } from "@/components/ui/action-button";

// Icons
import { FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ userName: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { loginAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.userName || !formData.password) {
      setError("Todos los campos son requeridos.");
      return;
    }
    try {
      await loginAdmin(formData.userName, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Acceso de Personal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Inicia sesión para acceder al panel de administración.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Login de Administrador</CardTitle>
              <CardDescription>
                Ingresa tus credenciales de acceso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="userName">Nombre de Usuario</Label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      placeholder="Nombre de usuario"
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      placeholder="Contraseña"
                      onChange={handleChange}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <ActionButton
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  loadingText="Iniciando sesión..."
                >
                  Iniciar Sesión
                </ActionButton>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
