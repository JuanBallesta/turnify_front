import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyAppointments,
  updateAppointment,
} from "@/services/AppointmentService";

// --- UI Components ---
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBox } from "@/components/ui/search-box";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/ui/action-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// --- Icons ---
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPlus,
  FiCheck,
  FiX,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";

// Componente de Ayuda para el Badge de Estado
const AppointmentStatusBadge = ({ status }) => {
  const statusInfo = {
    scheduled: {
      label: "Programada",
      className: "bg-blue-100 text-blue-800 hover:text-white ",
    },
    completed: {
      label: "Completada",
      className: "bg-green-100 text-green-800 hover:text-white",
    },
    cancelled: {
      label: "Cancelada",
      className: "bg-red-100 text-red-800 hover:text-white",
    },
  };
  const current = statusInfo[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge className={cn("font-medium", current.className)}>
      {current.label}
    </Badge>
  );
};

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch (err) {
      setError("No se pudieron cargar las citas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        (apt.offering?.name.toLowerCase() || "").includes(lowerSearch) ||
        (apt.offering?.business?.name.toLowerCase() || "").includes(
          lowerSearch,
        ) ||
        `${apt.client?.name || ""} ${apt.client?.lastName || ""}`
          .trim()
          .toLowerCase()
          .includes(lowerSearch) ||
        `${apt.employee?.name || ""} ${apt.employee?.lastName || ""}`
          .trim()
          .toLowerCase()
          .includes(lowerSearch);

      if (activeTab === "all") return matchesSearch;
      return matchesSearch && apt.status === activeTab;
    });
  }, [appointments, searchTerm, activeTab]);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      scheduled: appointments.filter((apt) => apt.status === "scheduled")
        .length,
      completed: appointments.filter((apt) => apt.status === "completed")
        .length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled")
        .length,
    }),
    [appointments],
  );

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    if (window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
      setIsActionLoading(true);
      try {
        await updateAppointment(selectedAppointment.id, {
          status: "cancelled",
        });
        setIsDetailModalOpen(false);
        loadAppointments();
      } catch (err) {
        alert("Error al cancelar la cita.");
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  if (isLoading)
    return (
      <>
        <div className="p-6 text-center">Cargando citas...</div>
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
          title="Mis Citas"
          description="Revisa tus citas programadas y tu historial de servicios"
          actions={
            user.role === "client" && (
              <Button onClick={() => navigate("/book")}>
                <FiPlus className="mr-2 h-4 w-4" /> Nueva Cita
              </Button>
            )
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Citas"
            value={stats.total}
            icon={FiCalendar}
          />
          <StatsCard
            title="Programadas"
            value={stats.scheduled}
            icon={FiClock}
            variant="primary"
          />
          <StatsCard
            title="Completadas"
            value={stats.completed}
            icon={FiCheck}
            variant="success"
          />
          <StatsCard
            title="Canceladas"
            value={stats.cancelled}
            icon={FiX}
            variant="danger"
          />
        </div>

        <div className="flex justify-between items-center">
          <SearchBox
            placeholder="Buscar por servicio, negocio, cliente..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="w-full sm:w-96"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
            <TabsTrigger value="scheduled">
              Programadas ({stats.scheduled})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completadas ({stats.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Canceladas ({stats.cancelled})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {filteredAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAppointments.map((apt) => {
                  const employeeName =
                    `${apt.employee?.name || ""} ${apt.employee?.lastName || ""}`.trim();
                  const clientName =
                    `${apt.client?.name || ""} ${apt.client?.lastName || ""}`.trim();
                  const serviceName =
                    apt.offering?.name || "Servicio no especificado";
                  const businessName =
                    apt.offering?.business?.name || "Negocio no disponible";

                  return (
                    <Card key={apt.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            {serviceName}
                          </CardTitle>
                          <AppointmentStatusBadge status={apt.status} />
                        </div>
                        <CardDescription className="flex items-center text-sm pt-1">
                          <FiMapPin className="h-3 w-3 mr-1.5" />
                          {businessName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center text-gray-700">
                          <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(apt.startTime).toLocaleString("es-ES", {
                            dateStyle: "full",
                            timeStyle: "short",
                          })}
                        </div>
                        {user.role !== "client" && (
                          <div className="flex items-center text-gray-700">
                            <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                            Cliente:{" "}
                            <span className="font-medium ml-1">
                              {clientName || "N/A"}
                            </span>
                          </div>
                        )}
                        {user.role !== "employee" && (
                          <div className="flex items-center text-gray-700">
                            <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                            Profesional:{" "}
                            <span className="font-medium ml-1">
                              {employeeName || "N/A"}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-end pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(apt)}
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent>
                  <EmptyState
                    icon={FiCalendar}
                    title="No se encontraron citas"
                    description="No hay citas que coincidan con los filtros actuales."
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* --- MODAL DE DETALLES MEJORADO --- */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAppointment.offering?.name}</DialogTitle>
                <DialogDescription>Detalles de la cita.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <span className="font-semibold">Estado</span>
                  <AppointmentStatusBadge status={selectedAppointment.status} />
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">
                    Servicio y Ubicación
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1 pl-2 border-l-2">
                    <p>
                      <span className="font-medium">Negocio:</span>{" "}
                      {selectedAppointment.offering?.business?.name}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span>{" "}
                      {selectedAppointment.offering?.business?.address}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">
                    Fecha y Participantes
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1 pl-2 border-l-2">
                    <p>
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(
                        selectedAppointment.startTime,
                      ).toLocaleDateString("es-ES", { dateStyle: "full" })}
                    </p>
                    <p>
                      <span className="font-medium">Hora:</span>{" "}
                      {new Date(
                        selectedAppointment.startTime,
                      ).toLocaleTimeString("es-ES", { timeStyle: "short" })}
                    </p>
                    <p>
                      <span className="font-medium">Profesional:</span>{" "}
                      {selectedAppointment.employee?.name}{" "}
                      {selectedAppointment.employee?.lastName}
                    </p>
                    {user.role !== "client" && (
                      <p>
                        <span className="font-medium">Cliente:</span>{" "}
                        {selectedAppointment.client?.name}{" "}
                        {selectedAppointment.client?.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">
                        Notas Adicionales
                      </h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  </>
                )}

                {/* --- AÑADIMOS EL PRECIO --- */}
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-gray-800 flex items-center">
                    <FiDollarSign className="mr-2 h-5 w-5" />
                    Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    $
                    {Number(selectedAppointment.offering?.price || 0).toFixed(
                      2,
                    )}
                  </span>
                </div>
              </div>
              <DialogFooter className="sm:justify-between mt-4">
                {selectedAppointment.status === "scheduled" ? (
                  <Button
                    variant="destructive"
                    onClick={handleCancelAppointment}
                    disabled={isActionLoading} // Deshabilitar mientras carga
                  >
                    {isActionLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <FiX className="mr-2 h-4 w-4" />
                        Cancelar Cita
                      </>
                    )}
                  </Button>
                ) : (
                  <div />
                )}{" "}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Appointments;
