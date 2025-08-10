import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";

const ChangePasswordDialog = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { changePassword, isLoading } = useAuth();

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    setError("");
    setSuccess("");
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("Debe tener al menos 8 caracteres");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Debe contener al menos una letra mayúscula");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Debe contener al menos una letra minúscula");
    }

    if (!/\d/.test(password)) {
      errors.push("Debe contener al menos un número");
    }

    return errors;
  };

  const getPasswordStrength = (password) => {
    const validationErrors = validatePassword(password);
    const strength = Math.max(0, 4 - validationErrors.length);

    switch (strength) {
      case 0:
      case 1:
        return { strength: 1, label: "Muy débil", color: "bg-red-500" };
      case 2:
        return { strength: 2, label: "Débil", color: "bg-orange-500" };
      case 3:
        return { strength: 3, label: "Buena", color: "bg-yellow-500" };
      case 4:
        return { strength: 4, label: "Fuerte", color: "bg-green-500" };
      default:
        return { strength: 0, label: "", color: "bg-gray-200" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las nuevas contraseñas no coinciden");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setError(
        `La nueva contraseña no cumple los requisitos: ${passwordErrors.join(", ")}`,
      );
      return;
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccess("Contraseña cambiada exitosamente");
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar la contraseña",
      );
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña actual y tu nueva contraseña para cambiarla.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-800 flex items-center">
                <FiCheck className="h-4 w-4 mr-2" />
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual *</Label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="pl-10 pr-10"
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? (
                  <FiEyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <FiEye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña *</Label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="pl-10 pr-10"
                placeholder="Ingresa tu nueva contraseña"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? (
                  <FiEyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <FiEye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>

            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Fortaleza de la contraseña:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.strength <= 2
                        ? "text-red-600"
                        : passwordStrength.strength === 3
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded ${
                        level <= passwordStrength.strength
                          ? passwordStrength.color
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmar Nueva Contraseña *
            </Label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="pl-10 pr-10"
                placeholder="Confirma tu nueva contraseña"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? (
                  <FiEyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <FiEye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>

            {formData.confirmPassword && (
              <div className="flex items-center text-xs">
                {formData.newPassword === formData.confirmPassword ? (
                  <div className="flex items-center text-green-600">
                    <FiCheck className="h-3 w-3 mr-1" />
                    Las contraseñas coinciden
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <FiX className="h-3 w-3 mr-1" />
                    Las contraseñas no coinciden
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
            <p className="font-medium mb-1">Requisitos de la contraseña:</p>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span
                  className={
                    formData.newPassword.length >= 8
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  • Al menos 8 caracteres
                </span>
              </li>
              <li className="flex items-center">
                <span
                  className={
                    /[A-Z]/.test(formData.newPassword)
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  • Una letra mayúscula
                </span>
              </li>
              <li className="flex items-center">
                <span
                  className={
                    /[a-z]/.test(formData.newPassword)
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  • Una letra minúscula
                </span>
              </li>
              <li className="flex items-center">
                <span
                  className={
                    /\d/.test(formData.newPassword)
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  • Un número
                </span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.currentPassword ||
                !formData.newPassword ||
                !formData.confirmPassword
              }
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
