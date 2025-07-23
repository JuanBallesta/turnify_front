import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// API Services
import {
  getMyAppointments,
  updateAppointment,
} from "@/services/AppointmentService";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // <-- Importamos Tooltip
import { cn } from "@/lib/utils";

// Icons
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
  FiPlus,
  FiDollarSign,
  FiUserX,
} from "react-icons/fi";

// Componente de Ayuda para el Badge de Estado
const AppointmentStatusBadge = ({ status }) => {
  const statusInfo = {
    scheduled: { label: "Programada", className: "bg-blue-100 text-blue-800" },
    completed: {
      label: "Completada",
      className: "bg-green-100 text-green-800",
    },
    cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800" },
    "no-show": {
      label: "No Asistió",
      className: "bg-yellow-100 text-yellow-800",
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const loadAppointments = () => {
    setIsLoading(true);
    getMyAppointments()
      .then(setAppointments)
      .catch(() => setError("No se pudieron cargar las citas."))
      .finally(() => setIsLoading(false));
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
        `${apt.client?.name || ""} ${apt.client?.lastName || ""}`
          .trim()
          .toLowerCase()
          .includes(lowerSearch) ||
        `${apt.employee?.name || ""} ${apt.employee?.lastName || ""}`
          .trim()
          .toLowerCase()
          .includes(lowerSearch);

      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const appointmentDate = new Date(apt.startTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === "today")
          matchesDate = appointmentDate.toDateString() === today.toDateString();
        else if (dateFilter === "upcoming")
          matchesDate = appointmentDate >= today;
        else if (dateFilter === "past") matchesDate = appointmentDate < today;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (
      newStatus === "cancelled" &&
      !window.confirm("¿Estás seguro de que quieres cancelar esta cita?")
    ) {
      return;
    }
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      loadAppointments();
    } catch (error) {
      alert(
        error.response?.data?.msg ||
          "Error al actualizar el estado de la cita.",
      );
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
      <div className="space-y-6 p-6">
        <PageHeader
          title="Gestión de Citas"
          description="Visualiza y administra todas las citas programadas"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar citas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="scheduled">Programada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="no-show">No Asistió</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="upcoming">Próximas</SelectItem>
                  <SelectItem value="past">Pasadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredAppointments.length === 0 ? (
          <EmptyState
            title="No se encontraron citas"
            description="Prueba ajustando los filtros."
          />
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const now = new Date();
              const appointmentTime = new Date(appointment.startTime);
              const hoursUntilAppointment =
                (appointmentTime - now) / (1000 * 60 * 60);
              const canCancel = hoursUntilAppointment > 24;

              return (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12 hidden sm:flex">
                          <AvatarImage
                            src={
                              user.role === "client"
                                ? appointment.employee?.photo
                                : appointment.client?.photo
                            }
                          />
                          <AvatarFallback className="bg-violet-100 text-violet-700">
                            {user.role === "client"
                              ? appointment.employee?.name?.[0]
                              : appointment.client?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {appointment.offering?.name ||
                                "Servicio no disponible"}
                            </h3>
                            <AppointmentStatusBadge
                              status={appointment.status}
                            />
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="h-4 w-4" />
                              <span>
                                {formatDate(appointment.startTime)} a las{" "}
                                {formatTime(appointment.startTime)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FiUser className="h-4 w-4" />
                              <span>
                                {user.role === "client"
                                  ? `Con ${appointment.employee?.name || ""} ${appointment.employee?.lastName || ""}`
                                  : `Cliente: ${appointment.client?.name || ""} ${appointment.client?.lastName || ""}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 w-full sm:w-auto">
                        <div className="text-lg font-semibold flex items-center">
                          <FiDollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {Number(appointment.offering?.price || 0).toFixed(2)}
                        </div>
                        {appointment.status === "scheduled" && (
                          <div className="flex space-x-2">
                            {user.role !== "client" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "completed",
                                    )
                                  }
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  title="Marcar como Completada"
                                >
                                  <FiCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "no-show",
                                    )
                                  }
                                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                  title="Marcar como No Asistió"
                                >
                                  <FiUserX className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span tabIndex={0}>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        canCancel &&
                                        handleStatusUpdate(
                                          appointment.id,
                                          "cancelled",
                                        )
                                      }
                                      disabled={!canCancel}
                                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <FiX className="h-4 w-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                {!canCancel && (
                                  <TooltipContent>
                                    <p>
                                      No se puede cancelar con menos de 24hs de
                                      anticipación.
                                    </p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Appointments;
