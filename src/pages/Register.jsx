// src/pages/Register.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    userName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { registerClient, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "El nombre es requerido.";
    if (!formData.lastName) newErrors.lastName = "El apellido es requerido.";
    if (!formData.userName)
      newErrors.userName = "El nombre de usuario es requerido.";
    if (!formData.email) newErrors.email = "El email es requerido.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "El formato del email es inválido.";
    if (!formData.phone) newErrors.phone = "El teléfono es requerido.";
    if (!formData.password) newErrors.password = "La contraseña es requerida.";
    else if (formData.password.length < 8)
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Preparamos los datos que el backend espera
      const userData = {
        name: formData.name,
        lastName: formData.lastName,
        userName: formData.userName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      };

      await registerClient(userData);
      navigate("/dashboard"); // Redirigir al dashboard después del registro y auto-login
    } catch (err) {
      setErrors({
        api: err.message || "Error en el registro. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crear una Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete para empezar a gestionar tus citas.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registro de Cliente</CardTitle>
            <CardDescription>
              Completa tus datos para crear una cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.api && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.api}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="userName">Nombre de Usuario *</Label>
                <Input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                />
                {errors.userName && (
                  <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="relative">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 bottom-0 h-9"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <ActionButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                loadingText="Creando cuenta..."
              >
                Crear Cuenta
              </ActionButton>
            </form>
            <div className="mt-6 text-center text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-violet-600 hover:text-violet-500"
              >
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
