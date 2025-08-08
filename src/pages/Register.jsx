import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { validatePassword, getPasswordStrength } from "@/lib/validators";
import { Progress } from "@/components/ui/progress";
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
import {
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { registerClient, isLoading } = useAuth();
  const navigate = useNavigate();
  const passwordValidationResult = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength(
    passwordValidationResult.requirements,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido.";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es requerido.";
    if (!formData.userName.trim())
      newErrors.userName = "El nombre de usuario es requerido.";
    if (!formData.email.trim()) newErrors.email = "El correo es requerido.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "El formato del correo es inválido.";
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido.";

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userData = {
        name: formData.name,
        lastName: formData.lastName,
        userName: formData.userName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      };
      await registerClient(userData);
      navigate("/dashboard");
    } catch (err) {
      const errorData = err.response?.data;

      if (errorData && Array.isArray(errorData.errors)) {
        // Si el backend envía errores específicos (ej. duplicados)
        const backendErrors = errorData.errors.reduce((acc, error) => {
          acc[error.path] = error.msg; // ej: acc['email'] = 'Este correo ya está en uso.'
          return acc;
        }, {});
        setErrors(backendErrors);
      } else {
        setErrors({
          api: err.message || "Error en el registro. Inténtalo de nuevo.",
        });
      }
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.userName}
                    </p>
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

                <div className="space-y-2">
                  <div className="relative">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-red-500" : ""}
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
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {formData.password && (
                  <div className="space-y-2 p-2 border rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Fortaleza:</span>
                      <span
                        className={`text-xs font-medium ${passwordStrength.color.replace("bg-", "text-")}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength.strength}
                      className={`h-1.5 ${passwordStrength.color}`}
                    />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.length ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.length ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>8+ caracteres</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.uppercase ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.uppercase ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>Mayúscula</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.lowercase ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.lowercase ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>Minúscula</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.number ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.number ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>Número</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.special ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.special ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>Carácter especial</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Label htmlFor="confirmPassword">
                    Confirmar Contraseña *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 bottom-0 h-9"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}

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
    </>
  );
};

export default Register;
