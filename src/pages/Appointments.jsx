import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyAppointments,
  updateAppointment,
} from "@/services/AppointmentService";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchBox } from "@/components/ui/search-box";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Icons
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
  FiPlus,
  FiUserX,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AppointmentStatusBadge = ({ status }) => {
  const statusInfo = {
    scheduled: {
      label: "Programada",
      className:
        "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    completed: {
      label: "Completada",
      className:
        "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
    },
    cancelled: {
      label: "Cancelada",
      className: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
    },
    "no-show": {
      label: "No Asistió",
      className:
        "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
  };
  const current = statusInfo[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  return (
    <Badge className={cn("font-semibold transition-colors", current.className)}>
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadAppointments = (pageToLoad) => {
    setIsLoading(true);
    setError(null);
    getMyAppointments(pageToLoad, 6)
      .then((response) => {
        setAppointments(response.data.appointments || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalItems(response.data.totalItems || 0);
      })
      .catch(() => setError("No se pudieron cargar las citas."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (user) {
      loadAppointments(currentPage);
    }
  }, [user, currentPage]);

  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];

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

  const stats = useMemo(
    () => ({
      total: totalItems,
      scheduled: appointments.filter((a) => a.status === "scheduled").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    }),
    [totalItems, appointments],
  );

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      loadAppointments(currentPage);
    } catch (error) {
      alert("Error al actualizar el estado de la cita.");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const getStatusLabel = (status) =>
    ({
      scheduled: "Programada",
      completed: "Completada",
      cancelled: "Cancelada",
      "no-show": "No Asistió",
    })[status] || status;
  const getStatusColor = (status) =>
    ({
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-yellow-100 text-yellow-800",
    })[status] || "bg-gray-100 text-gray-800";

  if (isLoading && appointments.length === 0)
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Citas"
            value={totalItems}
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchBox
                  placeholder="Buscar en la página actual..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por estado..." />
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
                  <SelectValue placeholder="Filtrar por fecha..." />
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

        {isLoading ? (
          <div className="text-center p-8">
            <LoadingSpinner />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title="No se encontraron citas"
            description="Prueba ajustando los filtros."
          />
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const now = new Date();
              const appointmentTime = new Date(appointment.startTime);
              const hasStarted = now >= appointmentTime;
              const isOwnerOrAdmin =
                user.role !== "employee" || user.id === appointment.employeeId;
              const canCancel = isOwnerOrAdmin && !hasStarted;

              const canMarkStatus = user.role !== "client" && hasStarted;

              const employeeName =
                `${appointment.employee?.name || ""} ${appointment.employee?.lastName || ""}`.trim();
              const clientName =
                `${appointment.client?.name || ""} ${appointment.client?.lastName || ""}`.trim();
              const mainContact =
                user.role === "client"
                  ? appointment.employee
                  : appointment.client;
              const photoUrl = mainContact?.photo
                ? `${API_URL}${mainContact.photo}`
                : undefined;
              const getInitials = (name) => {
                if (!name) return "?";
                const n = name.trim().split(" ");
                return n.length > 1
                  ? `${n[0][0]}${n[n.length - 1][0]}`.toUpperCase()
                  : n[0].substring(0, 2).toUpperCase();
              };

              return (
                <Card key={appointment.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={photoUrl} />
                        <AvatarFallback>
                          {getInitials(
                            `${mainContact?.name} ${mainContact?.lastName}`,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {appointment.offering?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.startTime).toLocaleString(
                            "es-ES",
                            { dateStyle: "long", timeStyle: "short" },
                          )}
                          hs
                        </p>
                        <div className="text-sm text-gray-500 mt-1">
                          {user.role !== "client" && (
                            <span className="flex items-center">
                              <FiUser className="h-3 w-3 mr-1.5" />
                              Cliente:{" "}
                              <strong className="ml-1 font-medium text-gray-600">
                                {clientName || "N/A"}
                              </strong>
                            </span>
                          )}
                          {user.role !== "employee" && (
                            <span className="flex items-center">
                              <FiUser className="h-3 w-3 mr-1.5" />
                              Profesional:{" "}
                              <strong className="ml-1 font-medium text-gray-600">
                                {employeeName || "N/A"}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <AppointmentStatusBadge status={appointment.status} />

                      {user.role !== "client" &&
                        appointment.status === "scheduled" && (
                          <div className="flex space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span tabIndex="0">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() =>
                                        canMarkStatus &&
                                        handleStatusUpdate(
                                          appointment.id,
                                          "completed",
                                        )
                                      }
                                      disabled={!canMarkStatus}
                                      className="text-green-600 border-green-200 hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <FiCheck />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                {!canMarkStatus && (
                                  <TooltipContent>
                                    <p>
                                      Solo se puede marcar después de la hora de
                                      la cita.
                                    </p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span tabIndex="0">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() =>
                                        canMarkStatus &&
                                        handleStatusUpdate(
                                          appointment.id,
                                          "no-show",
                                        )
                                      }
                                      disabled={!canMarkStatus}
                                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <FiUserX />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                {!canMarkStatus && (
                                  <TooltipContent>
                                    <p>
                                      Solo se puede marcar después de la hora de
                                      la cita.
                                    </p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}

                      {/* Acción de Cancelar */}
                      {appointment.status === "scheduled" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex="0">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    canCancel &&
                                    handleStatusUpdate(
                                      appointment.id,
                                      "cancelled",
                                    )
                                  }
                                  disabled={!canCancel}
                                  className="text-red-600 border-red-200 hover:bg-red-500 hover:text-white transition-colors disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FiX />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canCancel ? (
                                <p>Cancelar Cita</p>
                              ) : (
                                <p>
                                  No se puede cancelar una cita que ya ha
                                  comenzado.
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(totalPages).keys()].map((pageNumber) => (
                  <PaginationItem key={pageNumber + 1}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNumber + 1);
                      }}
                      isActive={currentPage === pageNumber + 1}
                    >
                      {pageNumber + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
};

export default Appointments;
