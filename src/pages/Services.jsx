import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllBusinessesForSelect } from "@/services/BusinessService";
import {
  getOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
  uploadOfferingPhoto,
} from "@/services/OfferingService";
import { getEmployees } from "@/services/EmployeeService";
import {
  getOfferingWithEmployees,
  updateAssignments,
} from "@/services/AssignmentService";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { SearchBox } from "@/components/ui/search-box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";

// Icons
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiClock,
  FiTag,
  FiImage,
  FiGrid,
  FiList,
  FiUsers,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getColumns = (handleEdit, handleDelete, handleAssign, isSuperUser) => [
  {
    key: "image",
    title: "",
    headerClassName: "w-16",
    render: (value, row) => (
      <Avatar className="h-10 w-10 rounded-md">
        <AvatarImage
          src={value ? `${API_URL}${value}` : undefined}
          alt={row.name}
          className="object-cover"
        />
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
          render: (val) => val || "N/A",
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
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: "actions",
    title: "Acciones",
    headerClassName: "text-right",
    render: (_, row) => (
      <div className="flex justify-end items-center">
        <Button size="sm" className="mr-2" onClick={() => handleAssign(row)}>
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
  const [selectedFile, setSelectedFile] = useState(null);
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
      const [servicesData, businessesData] = await Promise.all([
        getOfferings(),
        isSuperUser ? getAllBusinessesForSelect() : Promise.resolve([]),
      ]);
      setServices(servicesData);
      setBusinesses(businessesData);
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
    setSelectedFile(null);
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
    setSelectedFile(null);
    setServiceData({ ...service });
    setShowDialog(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setServiceData((prev) => ({ ...prev, image: previewUrl }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let servicePayload = { ...serviceData };
      delete servicePayload.image;

      let savedService;
      if (editingService) {
        const response = await updateOffering(
          editingService.id,
          servicePayload,
        );
        savedService = response.data;
      } else {
        const response = await createOffering(servicePayload);
        savedService = response.data;
      }

      if (selectedFile) {
        await uploadOfferingPhoto(savedService.id, selectedFile);
      }

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

  const tableColumns = getColumns(
    handleEdit,
    handleDelete,
    openAssignDialog,
    isSuperUser,
  );

  if (isLoading)
    return (
      <>
        <div className="p-6 text-center">Cargando...</div>
      </>
    );
  if (error)
    return (
      <>
        <div className="p-6 text-center text-red-500">{error}</div>
      </>
    );

  return (
    <>
      <div className="p-6 space-y-6">
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
                <FiList />
              </TabsTrigger>
              <TabsTrigger value="grid">
                <FiGrid />
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="list">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Lista de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={tableColumns} data={filteredServices} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="overflow-hidden flex flex-col group"
                >
                  <div className="h-48 bg-gray-100 overflow-hidden relative">
                    <img
                      src={
                        service.image ? `${API_URL}${service.image}` : undefined
                      }
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={service.isActive} />
                    </div>
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <Badge variant="secondary" className="self-start">
                      {service.category}
                    </Badge>
                    <h3 className="font-semibold text-lg mt-2">
                      {service.name}
                    </h3>
                    <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                      <span className="flex items-center">
                        <FiClock className="mr-1.5" />
                        {service.durationMinutes} min
                      </span>
                      <span className="font-bold text-base text-gray-800">
                        ${Number(service.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-auto pt-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssignDialog(service)}
                      >
                        Asignar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            <div>
              <Label htmlFor="image">Imagen del Servicio</Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  {serviceData.image ? (
                    <img
                      src={
                        serviceData.image.startsWith("blob:")
                          ? serviceData.image
                          : `${API_URL}${serviceData.image}`
                      }
                      alt="Vista previa"
                      className="mx-auto h-24 w-24 object-cover rounded-md"
                    />
                  ) : (
                    <FiImage className="mx-auto h-12 w-12 text-gray-300" />
                  )}
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <Label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-violet-600 focus-within:outline-none hover:text-violet-500"
                    >
                      <span>Sube un archivo</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </Label>
                    <p className="pl-1">o arrástralo aquí</p>
                  </div>
                </div>
              </div>
            </div>
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

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Asignar Empleados a "{assigningService?.name}"
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-80 overflow-y-auto space-y-2">
            {isAssigning ? (
              <p>Cargando...</p>
            ) : (
              employeesOfBusiness.map((emp) => (
                <div key={emp.id} className="flex items-center space-x-3 p-2">
                  <Checkbox
                    id={`emp-${emp.id}`}
                    checked={assignedEmployeeIds.has(emp.id)}
                    onCheckedChange={() => handleAssignmentChange(emp.id)}
                  />
                  <Label htmlFor={`emp-${emp.id}`}>
                    {emp.name} {emp.lastName}
                  </Label>
                </div>
              ))
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
              Guardar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Services;
