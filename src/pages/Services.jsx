import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

// API Services
import { getBusinesses } from "@/services/BusinessService";
import {
  getOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
} from "@/services/OfferingService";
import { getEmployees } from "@/services/EmployeeService";
import {
  getOfferingWithEmployees,
  updateAssignments,
} from "@/services/AssignmentService";

// UI Components
import Layout from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { SearchBox } from "@/components/ui/search-box";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Icons
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiSettings,
  FiDollarSign,
  FiClock,
  FiTag,
  FiImage,
  FiGrid,
  FiList,
  FiToggleLeft,
  FiToggleRight,
  FiUsers,
} from "react-icons/fi";

const getTableColumns = (
  handleEdit,
  handleDelete,
  handleAssign,
  isSuperUser,
) => [
  {
    key: "image",
    title: "",
    headerClassName: "w-16",
    render: (value, row) => (
      <Avatar className="h-10 w-10 rounded-md">
        <AvatarImage src={value} alt={row.name} className="object-cover" />
        <AvatarFallback className="rounded-md bg-gray-100">
          <FiTag className="h-5 w-5 text-gray-400" />
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    key: "name",
    title: "Servicio",
    render: (val, row) => (
      <div>
        <div className="font-medium">{val}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">
          {row.description}
        </div>
      </div>
    ),
  },
  ...(isSuperUser
    ? [
        {
          key: "business.name",
          title: "Negocio",
          render: (val) => <span className="text-sm">{val || "N/A"}</span>,
        },
      ]
    : []),
  {
    key: "category",
    title: "Categoría",
    render: (val) => <Badge variant="outline">{val}</Badge>,
  },
  {
    key: "durationMinutes",
    title: "Duración",
    render: (val) => (
      <div className="flex items-center text-sm">
        <FiClock className="mr-1.5 h-4 w-4 text-gray-400" /> {val} min
      </div>
    ),
  },
  {
    key: "price",
    title: "Precio",
    render: (val) => (
      <div className="font-semibold text-sm">${Number(val).toFixed(2)}</div>
    ),
  },
  {
    key: "isActive",
    title: "Estado",
    render: (val) => (
      <Badge
        className={cn(
          "font-medium",
          val ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
        )}
      >
        {val ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    key: "actions",
    title: "Acciones",
    headerClassName: "text-right",
    render: (_, row) => (
      <div className="flex justify-end items-center">
        <Button
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={() => handleAssign(row)}
        >
          <FiUsers className="mr-2 h-4 w-4" /> Asignar
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
          <FiEdit3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600"
          onClick={() => handleDelete(row.id)}
        >
          <FiTrash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceData, setServiceData] = useState({});
  const [activeView, setActiveView] = useState("list");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assigningService, setAssigningService] = useState(null);
  const [employeesOfBusiness, setEmployeesOfBusiness] = useState([]);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState(new Set());
  const [isAssigning, setIsAssigning] = useState(false);

  const isSuperUser = user?.role === "superuser";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const servicesData = await getOfferings();
      setServices(servicesData);
      if (isSuperUser) {
        const businessesData = await getBusinesses();
        setBusinesses(businessesData);
      }
    } catch (err) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user, isSuperUser]);

  const filteredServices = useMemo(
    () =>
      services.filter(
        (service) =>
          (service.name?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ) ||
          (service.description?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ) ||
          (service.category?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ),
      ),
    [services, searchTerm],
  );

  const handleCreate = () => {
    setEditingService(null);
    setServiceData({
      name: "",
      description: "",
      durationMinutes: 30,
      price: 0,
      category: "",
      image: "",
      businessId: !isSuperUser ? user.businessId : "",
      isActive: true,
    });
    setShowDialog(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceData({ ...service });
    setShowDialog(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (
        !serviceData.name ||
        !serviceData.category ||
        !serviceData.businessId ||
        serviceData.durationMinutes <= 0 ||
        serviceData.price < 0
      ) {
        alert("Por favor, completa todos los campos requeridos.");
        setIsSaving(false);
        return;
      }
      const dataToSave = { ...serviceData };
      if (dataToSave.image && dataToSave.image.startsWith("data:")) {
        delete dataToSave.image;
      }
      if (editingService) await updateOffering(editingService.id, dataToSave);
      else await createOffering(dataToSave);
      setShowDialog(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.msg || "Error al guardar el servicio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este servicio?")
    ) {
      try {
        await deleteOffering(serviceId);
        loadData();
      } catch (err) {
        alert(err.response?.data?.msg || "Error al eliminar el servicio.");
      }
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      await updateOffering(service.id, { isActive: !service.isActive });
      loadData();
    } catch (err) {
      alert("Error al cambiar el estado del servicio.");
    }
  };

  const openAssignDialog = async (service) => {
    setAssigningService(service);
    setIsAssigning(true);
    try {
      const [allEmps, serviceDetails] = await Promise.all([
        getEmployees(service.businessId),
        getOfferingWithEmployees(service.id),
      ]);
      setEmployeesOfBusiness(allEmps);
      setAssignedEmployeeIds(
        new Set(serviceDetails.employees.map((e) => e.id)),
      );
      setShowAssignDialog(true);
    } catch (err) {
      alert("Error al cargar datos de asignación.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignmentChange = (employeeId) => {
    setAssignedEmployeeIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (newIds.has(employeeId)) newIds.delete(employeeId);
      else newIds.add(employeeId);
      return newIds;
    });
  };

  const handleSaveAssignments = async () => {
    if (!assigningService) return;
    setIsAssigning(true);
    try {
      await updateAssignments(
        assigningService.id,
        Array.from(assignedEmployeeIds),
      );
      setShowAssignDialog(false);
      alert("Asignaciones guardadas correctamente.");
    } catch (err) {
      alert("Error al guardar las asignaciones.");
    } finally {
      setIsAssigning(false);
    }
  };

  const tableColumns = getTableColumns(
    handleEdit,
    handleDelete,
    openAssignDialog,
    isSuperUser,
  );

  if (isLoading)
    return (
      <Layout>
        <div>Cargando...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div>{error}</div>
      </Layout>
    );

  return (
    <>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Gestión de Servicios"
          actions={
            <Button onClick={handleCreate}>
              <FiPlus className="mr-2 h-4 w-4" /> Nuevo Servicio
            </Button>
          }
        />
        <Tabs
          value={activeView}
          onValueChange={setActiveView}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <SearchBox
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder="Buscar por nombre o categoría..."
              className="w-full max-w-sm"
            />
            <TabsList>
              <TabsTrigger value="list">
                <FiList className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="grid">
                <FiGrid className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="list">
            <Card className="border-0 shadow-sm mt-4">
              <CardHeader>
                <CardTitle>Lista de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredServices.length > 0 ? (
                  <DataTable columns={tableColumns} data={filteredServices} />
                ) : (
                  <EmptyState
                    icon={FiSettings}
                    title="No hay servicios"
                    description="Comienza creando tu primer servicio."
                    onAction={handleCreate}
                    action="Crear Servicio"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="grid">
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="overflow-hidden flex flex-col"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 rounded-lg">
                            <AvatarImage
                              src={service.image}
                              alt={service.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="rounded-lg bg-gray-100">
                              <FiTag />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {service.name}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {service.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "font-medium",
                            service.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800",
                          )}
                        >
                          {service.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-grow flex flex-col justify-between">
                      <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">
                        {service.description}
                      </p>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <FiClock className="h-4 w-4" />
                            <span>{service.durationMinutes} minutos</span>
                          </div>
                          <div className="flex items-center space-x-1 font-semibold text-lg">
                            <FiDollarSign className="h-4 w-4 text-gray-400" />
                            <span>{Number(service.price).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleServiceStatus(service)}
                          >
                            <div className="flex items-center">
                              {service.isActive ? (
                                <FiToggleRight className="h-4 w-4 mr-1" />
                              ) : (
                                <FiToggleLeft className="h-4 w-4 mr-1" />
                              )}{" "}
                              {service.isActive ? "Desactivar" : "Activar"}
                            </div>
                          </Button>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAssignDialog(service)}
                            >
                              <FiUsers className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <FiEdit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(service.id)}
                              className="text-red-600"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={FiSearch}
                  title="No se encontraron servicios"
                  description="Prueba ajustando tus términos de búsqueda."
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Servicio" : "Crear Servicio"}
            </DialogTitle>
            <DialogDescription>
              Completa la información del servicio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={serviceData.name || ""}
                  onChange={(e) =>
                    setServiceData({ ...serviceData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Input
                  id="category"
                  value={serviceData.category || ""}
                  onChange={(e) =>
                    setServiceData({ ...serviceData, category: e.target.value })
                  }
                />
              </div>
            </div>
            {isSuperUser && (
              <div>
                <Label htmlFor="businessId">Negocio *</Label>
                <Select
                  value={serviceData.businessId?.toString()}
                  onValueChange={(val) =>
                    setServiceData({ ...serviceData, businessId: Number(val) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationMinutes">Duración (min) *</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  value={serviceData.durationMinutes || ""}
                  onChange={(e) =>
                    setServiceData({
                      ...serviceData,
                      durationMinutes: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="price">Precio ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={serviceData.price || ""}
                  onChange={(e) =>
                    setServiceData({
                      ...serviceData,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={serviceData.description || ""}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="image">URL de Imagen</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={serviceData.image || ""}
                onChange={(e) =>
                  setServiceData({ ...serviceData, image: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={serviceData.isActive ?? true}
                onCheckedChange={(checked) =>
                  setServiceData({ ...serviceData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Servicio Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <ActionButton onClick={handleSave} isLoading={isSaving}>
              Guardar Servicio
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL PARA ASIGNAR EMPLEADOS --- */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Asignar Empleados a "{assigningService?.name}"
            </DialogTitle>

            {/* --- ¡SOLUCIÓN! AÑADIR ESTA LÍNEA --- */}
            <DialogDescription>
              Selecciona los empleados que pueden realizar este servicio. Los
              cambios se guardarán para futuras reservas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-80 overflow-y-auto space-y-2">
            {isAssigning ? (
              <p className="text-center text-gray-500">Cargando empleados...</p>
            ) : employeesOfBusiness.length > 0 ? (
              employeesOfBusiness.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
                >
                  <Checkbox
                    id={`emp-assign-${emp.id}`}
                    checked={assignedEmployeeIds.has(emp.id)}
                    onCheckedChange={() => handleAssignmentChange(emp.id)}
                  />
                  <Label
                    htmlFor={`emp-assign-${emp.id}`}
                    className="cursor-pointer flex-1"
                  >
                    {emp.name} {emp.lastName}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-gray-500 py-4">
                No hay empleados en este negocio.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancelar
            </Button>
            <ActionButton
              onClick={handleSaveAssignments}
              isLoading={isAssigning}
            >
              Guardar Asignaciones
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Services;
