import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/ui/action-button";
import { DataTable } from "@/components/ui/data-table";
import { SearchBox } from "@/components/ui/search-box";
import { StatsCard } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiEye,
  FiSave,
  FiX,
  FiCheck,
  FiDollarSign,
  FiClock,
  FiTag,
  FiImage,
  FiSettings,
  FiTrendingUp,
  FiUsers,
  FiStar,
} from "react-icons/fi";

const Services = () => {
  const { user } = useAuth();
  const { services, setServices, businesses } = useApp();

  // Estados principales
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Estados del formulario
  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    category: "",
    tags: "",
    businessId: "",
    image: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState("");

  // Categorías disponibles
  const categories = [
    "Cabello",
    "Uñas",
    "Facial",
    "Bienestar",
    "Depilación",
    "Masajes",
    "Estética",
  ];

  // Filtrar servicios
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const stats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    categories: new Set(services.map((s) => s.category)).size,
    avgPrice:
      services.reduce((sum, s) => sum + s.price, 0) / services.length || 0,
  };

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: "image",
      title: "Imagen",
      render: (value, row) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          {value ? (
            <img
              src={value}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiImage className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      title: "Servicio",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 truncate max-w-[200px]">
            {row.description}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Categoría",
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "duration",
      title: "Duración",
      render: (value) => (
        <div className="flex items-center space-x-1">
          <FiClock className="w-4 h-4 text-gray-400" />
          <span>{value} min</span>
        </div>
      ),
    },
    {
      key: "price",
      title: "Precio",
      render: (value) => (
        <div className="flex items-center space-x-1 font-medium">
          <FiDollarSign className="w-4 h-4 text-gray-400" />
          <span>${value}</span>
        </div>
      ),
    },
    {
      key: "rating",
      title: "Rating",
      render: (value) => (
        <div className="flex items-center space-x-1">
          <FiStar className="w-4 h-4 text-yellow-500" />
          <span>{value?.toFixed(1) || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Estado",
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditService(row)}
          >
            <FiEdit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setServiceData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!serviceData.name.trim()) {
      errors.name = "El nombre es requerido";
    }

    if (!serviceData.description.trim()) {
      errors.description = "La descripción es requerida";
    }

    if (!serviceData.category) {
      errors.category = "La categoría es requerida";
    }

    if (!serviceData.businessId) {
      errors.businessId = "El negocio es requerido";
    }

    if (serviceData.duration < 15) {
      errors.duration = "La duración mínima es 15 minutos";
    }

    if (serviceData.price < 0) {
      errors.price = "El precio no puede ser negativo";
    }

    return errors;
  };

  // Crear/editar servicio
  const handleSaveService = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const tagsArray = serviceData.tags
        ? serviceData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      if (editingService) {
        // Editar servicio existente
        const updatedServices = services.map((service) =>
          service.id === editingService.id
            ? {
                ...service,
                ...serviceData,
                tags: tagsArray,
                updatedAt: new Date().toISOString(),
              }
            : service,
        );
        setServices(updatedServices);
        setFormSuccess("Servicio actualizado exitosamente");
      } else {
        // Crear nuevo servicio
        const newService = {
          id: `service_${Date.now()}`,
          ...serviceData,
          tags: tagsArray,
          rating: 0,
          totalReviews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setServices([...services, newService]);
        setFormSuccess("Servicio creado exitosamente");
      }

      setTimeout(() => {
        setFormSuccess("");
        handleCloseDialog();
      }, 2000);
    } catch (error) {
      setFormErrors({ general: "Error al guardar el servicio" });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar servicio
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedServices = services.filter(
        (service) => service.id !== serviceToDelete.id,
      );
      setServices(updatedServices);

      setShowDeleteDialog(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir dialog para crear servicio
  const handleCreateService = () => {
    setEditingService(null);
    setServiceData({
      name: "",
      description: "",
      duration: 30,
      price: 0,
      category: "",
      tags: "",
      businessId: user.businessId || "",
      image: "",
      isActive: true,
    });
    setFormErrors({});
    setShowServiceDialog(true);
  };

  // Abrir dialog para editar servicio
  const handleEditService = (service) => {
    setEditingService(service);
    setServiceData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      tags: service.tags ? service.tags.join(", ") : "",
      businessId: service.businessId,
      image: service.image || "",
      isActive: service.isActive,
    });
    setFormErrors({});
    setShowServiceDialog(true);
  };

  // Manejar click de eliminar
  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteDialog(true);
  };

  // Cerrar dialog
  const handleCloseDialog = () => {
    setShowServiceDialog(false);
    setEditingService(null);
    setFormErrors({});
    setFormSuccess("");
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Gestión de Servicios"
        description="Administra los servicios disponibles en tu negocio"
        breadcrumbs={[{ label: "Servicios", href: "/services" }]}
        actions={
          <ActionButton icon={FiPlus} onClick={handleCreateService}>
            Nuevo Servicio
          </ActionButton>
        }
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Servicios"
          value={stats.total}
          description="Servicios registrados"
          icon={FiSettings}
          variant="default"
        />
        <StatsCard
          title="Servicios Activos"
          value={stats.active}
          description="Disponibles para reserva"
          icon={FiCheck}
          variant="success"
        />
        <StatsCard
          title="Categorías"
          value={stats.categories}
          description="Tipos de servicios"
          icon={FiTag}
          variant="primary"
        />
        <StatsCard
          title="Precio Promedio"
          value={`$${stats.avgPrice.toFixed(0)}`}
          description="Precio medio de servicios"
          icon={FiDollarSign}
          variant="default"
        />
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="w-full sm:w-96">
                <SearchBox
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredServices.length} servicio(s) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServices.length > 0 ? (
            <DataTable columns={columns} data={filteredServices} />
          ) : (
            <EmptyState
              icon={FiSearch}
              title="No se encontraron servicios"
              description="Prueba ajustando los filtros o crea un nuevo servicio."
              action="Crear Nuevo Servicio"
              onAction={handleCreateService}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar servicio */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Servicio" : "Crear Nuevo Servicio"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Actualiza la información del servicio"
                : "Completa los datos para crear un nuevo servicio"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {formSuccess && (
              <Alert>
                <FiCheck className="h-4 w-4" />
                <AlertDescription>{formSuccess}</AlertDescription>
              </Alert>
            )}

            {formErrors.general && (
              <Alert variant="destructive">
                <AlertDescription>{formErrors.general}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nombre del Servicio"
                htmlFor="serviceName"
                required
                error={formErrors.name}
                className="md:col-span-2"
              >
                <Input
                  id="serviceName"
                  value={serviceData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Ej: Corte de cabello premium"
                />
              </FormField>

              <FormField
                label="Categoría"
                htmlFor="category"
                required
                error={formErrors.category}
              >
                <Select
                  value={serviceData.category}
                  onValueChange={(value) => handleFormChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Negocio"
                htmlFor="business"
                required
                error={formErrors.businessId}
              >
                <Select
                  value={serviceData.businessId}
                  onValueChange={(value) =>
                    handleFormChange("businessId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar negocio" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Duración (minutos)"
                htmlFor="duration"
                required
                error={formErrors.duration}
              >
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={serviceData.duration}
                  onChange={(e) =>
                    handleFormChange("duration", parseInt(e.target.value))
                  }
                />
              </FormField>

              <FormField
                label="Precio ($)"
                htmlFor="price"
                required
                error={formErrors.price}
              >
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={serviceData.price}
                  onChange={(e) =>
                    handleFormChange("price", parseFloat(e.target.value))
                  }
                />
              </FormField>

              <FormField
                label="URL de Imagen"
                htmlFor="image"
                description="URL de la imagen del servicio (opcional)"
              >
                <Input
                  id="image"
                  type="url"
                  value={serviceData.image}
                  onChange={(e) => handleFormChange("image", e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </FormField>
            </div>

            <FormField
              label="Descripción"
              htmlFor="description"
              required
              error={formErrors.description}
            >
              <Textarea
                id="description"
                value={serviceData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Describe el servicio en detalle..."
                rows={3}
              />
            </FormField>

            <FormField
              label="Etiquetas"
              htmlFor="tags"
              description="Palabras clave separadas por comas (ej: corte, moderno, profesional)"
            >
              <Input
                id="tags"
                value={serviceData.tags}
                onChange={(e) => handleFormChange("tags", e.target.value)}
                placeholder="corte, moderno, profesional"
              />
            </FormField>

            <FormField label="Estado del Servicio">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={serviceData.isActive}
                  onChange={(e) =>
                    handleFormChange("isActive", e.target.checked)
                  }
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <Label htmlFor="isActive">
                  Servicio activo y disponible para reservas
                </Label>
              </div>
            </FormField>

            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
                disabled={isLoading}
              >
                <FiX className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <ActionButton
                onClick={handleSaveService}
                isLoading={isLoading}
                loadingText={editingService ? "Actualizando..." : "Creando..."}
                icon={FiSave}
                className="flex-1"
              >
                {editingService ? "Actualizar Servicio" : "Crear Servicio"}
              </ActionButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Servicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el servicio "
              {serviceToDelete?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <ActionButton
              onClick={handleDeleteService}
              isLoading={isLoading}
              loadingText="Eliminando..."
              variant="destructive"
              icon={FiTrash2}
              className="flex-1"
            >
              Eliminar
            </ActionButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Services;
