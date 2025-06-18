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

// 1. Importamos todos los servicios necesarios de la API
import { createEmployee, updateEmployee } from "@/services/EmployeeService";
import { getBusinesses } from "@/services/BusinessService";
import { getUserTypes } from "@/services/UserTypeService";

// Estado inicial del formulario vacío para reutilizarlo
const INITIAL_FORM_STATE = {
  name: "",
  lastName: "",
  username: "",
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
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para los datos de los menús desplegables
  const [businesses, setBusinesses] = useState([]);
  const [userTypes, setUserTypes] = useState([]);

  const isEditing = !!employee;

  // 2. Carga los datos para los <Select> (negocios y roles) cuando el modal se abre
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        const [businessesData, userTypesData] = await Promise.all([
          getBusinesses(),
          getUserTypes(),
        ]);
        setBusinesses(businessesData);
        setUserTypes(userTypesData);
      } catch (error) {
        console.error("Error al cargar datos para el formulario:", error);
      }
    };

    if (open) {
      loadSelectData();
    }
  }, [open]);

  // 3. Carga los datos del empleado a editar o resetea el formulario al abrir
  useEffect(() => {
    if (open) {
      if (isEditing) {
        setFormData({
          name: employee.name || "",
          lastName: employee.lastName || "",
          username: employee.username || "",
          password: "", // La contraseña NUNCA se pre-carga
          email: employee.email || "",
          phone: employee.phone || "",
          businessId: employee.businessId?.toString() || "", // Convertir a string para el <Select>
          userTypeId: employee.userTypeId?.toString() || "", // Convertir a string
        });
        setIsActive(employee.isActive);
      } else {
        setFormData(INITIAL_FORM_STATE);
        setIsActive(true);
      }
      setErrors({}); // Limpia errores al abrir
    }
  }, [open, employee, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 4. Validación simple en el frontend
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "El nombre es requerido.";
    if (!formData.lastName) newErrors.lastName = "El apellido es requerido.";
    if (!formData.username)
      newErrors.username = "El nombre de usuario es requerido.";
    if (!formData.email) newErrors.email = "El correo es requerido.";
    if (!isEditing && !formData.password)
      newErrors.password = "La contraseña es requerida para nuevos empleados.";
    if (!formData.businessId)
      newErrors.businessId = "Debe seleccionar un negocio.";
    if (!formData.userTypeId) newErrors.userTypeId = "Debe seleccionar un rol.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 5. Función de envío conectada a la API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({}); // Limpiar errores antes de enviar

    const finalData = {
      ...formData,
      isActive,
      // Asegurarse de que los IDs sean números si la API lo requiere
      businessId: parseInt(formData.businessId, 10),
      userTypeId: parseInt(formData.userTypeId, 10),
    };

    // No enviar la contraseña si está vacía (en modo edición)
    if (isEditing && !finalData.password) {
      delete finalData.password;
    }

    try {
      if (isEditing) {
        await updateEmployee(employee.id, finalData);
      } else {
        await createEmployee(finalData);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData && errorData.errors) {
        // Manejar errores de validación específicos del backend
        const backendErrors = errorData.errors.reduce((acc, err) => {
          acc[err.path] = err.msg;
          return acc;
        }, {});
        setErrors(backendErrors);
      } else {
        alert(errorData?.msg || "No se pudo guardar el empleado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Empleado" : "Crear Nuevo Empleado"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza la información del empleado."
              : "Completa los detalles para crear un nuevo empleado."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ingresa el nombre"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
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
                  placeholder="Ingresa el apellido"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario *</Label>
              <Input
                id="username"
                placeholder="Ingresa el nombre de usuario"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                placeholder="empleado@empresa.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
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
                placeholder="+54 (11) 1234-5678"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña{" "}
                {isEditing ? "(Dejar en blanco para no cambiar)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa una contraseña segura"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessId">Negocio *</Label>
              <Select
                value={formData.businessId}
                onValueChange={(value) =>
                  handleInputChange("businessId", value)
                }
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

            {isEditing && (
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Empleado Activo</Label>
              </div>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Actualizando..."
                  : "Creando..."
                : "Crear Empleado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
