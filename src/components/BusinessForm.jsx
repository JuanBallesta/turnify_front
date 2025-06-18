import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { createBusiness, updateBusiness } from "../services/BusinessService";

export default function BusinessForm({
  business,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!business;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: business.name || "",
        address: business.address || "",
        phone: business.phone || "",
        email: business.email || "",
        description: business.description || "",
        logo: business.logo || "",
      });
    } else {
      // Si abrimos para crear, reseteamos el formulario
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        description: "",
        logo: "",
      });
    }
    setErrors({}); // Limpiar errores al abrir el modal
  }, [open, business, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 💡 CAMBIO 3: Validación simple dentro del componente
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "El nombre es requerido.";
    if (!formData.email)
      newErrors.email = "El correo electrónico es requerido.";
    if (!formData.phone) newErrors.phone = "El teléfono es requerido.";
    if (!formData.address) newErrors.address = "La dirección es requerida.";
    if (!formData.description)
      newErrors.description = "La descripción es requerida.";

    // Validar formato de email (simple)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El formato del correo no es válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 💡 CAMBIO 4: handleSubmit ahora usa el servicio de API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Llamada a la API para actualizar
        await updateBusiness(business.id, formData);
      } else {
        // Llamada a la API para crear
        await createBusiness(formData);
      }
      onSuccess(); // Llama a la función del padre para recargar la lista
      onOpenChange(false); // Cierra el modal
    } catch (error) {
      console.error("Error al guardar el negocio:", error);
      // Opcional: Mostrar un error genérico al usuario
      // setErrors({ submit: "No se pudo guardar el negocio. Inténtelo de nuevo." });
      alert(
        "No se pudo guardar el negocio. Revise la consola para más detalles.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // onOpenChange es lo que permite cerrar el modal al hacer clic fuera o presionar ESC
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Negocio" : "Crear Nuevo Negocio"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza la información del negocio."
              : "Completa los detalles para crear un nuevo negocio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            {/* El resto del formulario es idéntico, ya que la lógica de renderizado está bien */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Negocio *</Label>
              <Input
                id="name"
                placeholder="Ingresa el nombre del negocio"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@negocio.com"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+52 (55) 123-4567"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                placeholder="Calle del Negocio 123, Ciudad"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">URL del Logo</Label>
              <Input
                id="logo"
                type="url"
                placeholder="https://ejemplo.com/logo.png"
                value={formData.logo || ""}
                onChange={(e) => handleInputChange("logo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe tu negocio..."
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Actualizando..."
                  : "Creando..."
                : isEditing
                  ? "Actualizar Negocio"
                  : "Crear Negocio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
