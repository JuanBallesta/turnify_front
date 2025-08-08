import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { validatePassword, getPasswordStrength } from "@/lib/validators";
import { Check, X } from "lucide-react";

import { createEmployee, updateEmployee } from "@/services/EmployeeService";
import { getBusinesses } from "@/services/BusinessService";
import { getUserTypes } from "@/services/UserTypeService";
import { getAllBusinessesForSelect } from "@/services/BusinessService";

const INITIAL_FORM_STATE = {
  name: "",
  lastName: "",
  userName: "",
  password: "",
  email: "",
  phone: "",
  businessId: "",
  userTypeId: "",
};

export default function EmployeeForm({
  employee,
  open,
  onOpenChange,
  onSuccess,
  currentUser,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isEditing = !!employee;
  const isSuperUser = currentUser?.role === "superuser";

  const passwordValidationResult = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength(
    passwordValidationResult.requirements,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadAndInitialize = async () => {
      setIsLoadingData(true);
      setErrors({});
      try {
        const [businessesData, userTypesData] = await Promise.all([
          getAllBusinessesForSelect(),
          getUserTypes(),
        ]);

        setBusinesses(businessesData);
        if (!isSuperUser) {
          setUserTypes(
            userTypesData.filter(
              (type) => type.name.toLowerCase() !== "super usuario",
            ),
          );
        } else {
          setUserTypes(userTypesData);
        }

        if (isEditing) {
          setFormData({
            name: employee.name || "",
            lastName: employee.lastName || "",
            username: employee.userName || "",
            password: "",
            email: employee.email || "",
            phone: employee.phone || "",
            businessId:
              employee.business?.id?.toString() ||
              employee.businessId?.toString() ||
              "",
            userTypeId:
              employee.userType?.id?.toString() ||
              employee.userTypeId?.toString() ||
              "",
          });
          setIsActive(employee.isActive ?? true);
        } else {
          const isRestrictedAdmin = currentUser?.role === "administrator";
          const businessIdFromUser = isRestrictedAdmin
            ? currentUser?.businessId
            : null;
          setFormData({
            ...INITIAL_FORM_STATE,
            businessId: businessIdFromUser ? businessIdFromUser.toString() : "",
          });
          setIsActive(true);
        }
      } catch (error) {
        console.error("Error al cargar o inicializar el formulario:", error);
        setErrors({
          general: "No se pudo cargar la información del formulario.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAndInitialize();
  }, [open, employee, currentUser, isEditing, isSuperUser]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const newErrors = {};
    if (!isEditing) {
      if (!formData.name.trim()) newErrors.name = "El nombre es requerido.";
      if (!formData.lastName.trim())
        newErrors.lastName = "El apellido es requerido.";
      if (!formData.userName.trim())
        newErrors.userName = "El nombre de usuario es requerido.";
      if (!formData.email.trim()) newErrors.email = "El correo es requerido.";

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }
    if (!formData.businessId)
      newErrors.businessId = "Debe seleccionar un negocio.";
    if (!formData.userTypeId) newErrors.userTypeId = "Debe seleccionar un rol.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    let dataToSend;
    if (isEditing) {
      dataToSend = {
        businessId: parseInt(formData.businessId, 10),
        userTypeId: parseInt(formData.userTypeId, 10),
        isActive: isActive,
      };
    } else {
      dataToSend = {
        ...formData,
        isActive,
        businessId: parseInt(formData.businessId, 10),
        userTypeId: parseInt(formData.userTypeId, 10),
      };
    }

    try {
      if (isEditing) await updateEmployee(employee.id, dataToSend);
      else await createEmployee(dataToSend);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const errorData = error.response?.data;

      if (errorData && Array.isArray(errorData.errors)) {
        const backendErrors = errorData.errors.reduce((acc, err) => {
          acc[err.path] = err.msg; // ej: acc['userName'] = 'Este nombre de usuario ya está en uso.'
          return acc;
        }, {});
        setErrors(backendErrors); // ¡Esto mostrará el error debajo del campo correcto!
      } else {
        alert(errorData?.msg || "No se pudo guardar el empleado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdminCreating = currentUser?.role === "administrator" && !isEditing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Gestionar a ${formData.name} ${formData.lastName}`
              : "Crear Nuevo Empleado"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica el rol, negocio o estado del empleado."
              : "Completa los detalles para crear un nuevo empleado."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="py-24 text-center text-gray-500">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid gap-4">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userName">Nombre de Usuario *</Label>
                    <Input
                      id="userName"
                      value={formData.userName}
                      onChange={(e) =>
                        handleInputChange("userName", e.target.value)
                      }
                      className={errors.userName ? "border-red-500" : ""}
                    />
                    {errors.userName && (
                      <p className="text-sm text-red-500">{errors.userName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Número de Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {!isEditing && formData.password && (
                    <div className="space-y-2 p-3 border rounded-md bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          Fortaleza:
                        </span>
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
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>8+ caracteres</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${passwordValidationResult.requirements.uppercase ? "text-green-600" : "text-gray-500"}`}
                        >
                          {passwordValidationResult.requirements.uppercase ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>Mayúscula</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${passwordValidationResult.requirements.lowercase ? "text-green-600" : "text-gray-500"}`}
                        >
                          {passwordValidationResult.requirements.lowercase ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>Minúscula</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${passwordValidationResult.requirements.number ? "text-green-600" : "text-gray-500"}`}
                        >
                          {passwordValidationResult.requirements.number ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>Número</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${passwordValidationResult.requirements.special ? "text-green-600" : "text-gray-500"}`}
                        >
                          {passwordValidationResult.requirements.special ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>Carácter especial</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="font-medium text-gray-800">
                    {formData.name} {formData.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                </div>
              )}

              <Separator />
              <p className="text-sm font-semibold text-gray-600 -mb-2">
                Datos de Gestión
              </p>

              <div className="space-y-2">
                <Label htmlFor="businessId">Negocio *</Label>
                <Select
                  value={formData.businessId}
                  onValueChange={(value) =>
                    handleInputChange("businessId", value)
                  }
                  disabled={isAdminCreating || !isSuperUser}
                >
                  <SelectTrigger
                    className={errors.businessId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona un negocio" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem
                        key={business.id}
                        value={business.id.toString()}
                      >
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isAdminCreating && (
                  <p className="text-xs text-gray-500">
                    El empleado se asignará a tu negocio.
                  </p>
                )}
                {!isSuperUser && isEditing && (
                  <p className="text-xs text-gray-500">
                    Solo un Super Usuario puede cambiar el negocio.
                  </p>
                )}
                {errors.businessId && (
                  <p className="text-sm text-red-500">{errors.businessId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userTypeId">Rol de Usuario *</Label>
                <Select
                  value={formData.userTypeId}
                  onValueChange={(value) =>
                    handleInputChange("userTypeId", value)
                  }
                >
                  <SelectTrigger
                    className={errors.userTypeId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((userType) => (
                      <SelectItem
                        key={userType.id}
                        value={userType.id.toString()}
                      >
                        {userType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.userTypeId && (
                  <p className="text-sm text-red-500">{errors.userTypeId}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Empleado Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingData}>
                {isSubmitting
                  ? isEditing
                    ? "Actualizando..."
                    : "Creando..."
                  : isEditing
                    ? "Guardar Cambios"
                    : "Crear Empleado"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
