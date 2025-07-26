import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyAppointments,
  updateAppointment,
  getAppointmentStats,
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
  FiDollarSign,
  FiUserX,
  FiMapPin,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AppointmentStatusBadge = ({ status }) => {
  const statusInfo = {
    scheduled: {
      label: "Programada",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    completed: {
      label: "Completada",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    cancelled: {
      label: "Cancelada",
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
    "no-show": {
      label: "No Asistió",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
  };

  const currentStatus = statusInfo[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  return (
    <Badge
      className={cn(
        "font-medium border-transparent transition-colors",
        currentStatus.className,
      )}
    >
      {currentStatus.label}
    </Badge>
  );
};
const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    "no-show": 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const loadAppointments = (
    page = 1,
    status = "all",
    search = "",
    dateParam = "all",
  ) => {
    setIsLoading(true);
    setError(null);
    getMyAppointments(page, status, search, dateParam)
      .then((data) => {
        setAppointments(data.appointments || []);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
        });
      })
      .catch(() => setError("No se pudieron cargar las citas."))
      .finally(() => setIsLoading(false));
  };

  const loadStats = () => {
    getAppointmentStats()
      .then(setStats)
      .catch(() => setError("No se pudieron cargar las estadísticas."));
  };

  useEffect(() => {
    if (user) {
      loadAppointments(1, activeTab, searchTerm, dateFilter);
      loadStats();
    }
  }, [user, activeTab, searchTerm, dateFilter]);

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= pagination.totalPages &&
      newPage !== pagination.currentPage
    ) {
      loadAppointments(newPage, activeTab, searchTerm, dateFilter);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      loadAppointments(pagination.currentPage, activeTab, searchTerm);
      loadStats();
    } catch (error) {
      alert("Error al actualizar el estado de la cita.");
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
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length > 1)
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (!user)
    return (
      <>
        <div className="p-6 text-center">Cargando...</div>
      </>
    );
  if (error && appointments.length === 0)
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
            title="Canceladas / No Asistió"
            value={stats.cancelled + (stats["no-show"] || 0)}
            icon={FiX}
            variant="danger"
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
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
              <div className="flex-1">
                <SearchBox
                  placeholder="Buscar por servicio, cliente..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  <TabsTrigger value="no-show">
                    No Asistió ({stats["no-show"] || 0})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center p-8">
            <LoadingSpinner />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No se encontraron citas"
            description="No hay citas que coincidan con los filtros actuales."
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const mainContact =
                user.role === "client"
                  ? appointment.employee
                  : appointment.client;
              const photoUrl = mainContact?.photo
                ? `${API_URL}${mainContact.photo}`
                : undefined;
              const canCancel =
                (new Date(appointment.startTime) - new Date()) /
                  (1000 * 60 * 60) >
                24;
              const hasStarted = new Date() >= new Date(appointment.startTime);
              return (
                <Card key={appointment.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={photoUrl} />
                        <AvatarFallback>
                          {getInitials(
                            `${mainContact?.name} ${mainContact?.lastName}`,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-bold text-lg">
                          {appointment.offering?.name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiCalendar className="w-4 h-4 mr-2" />
                          {formatDate(appointment.startTime)} a las{" "}
                          {formatTime(appointment.startTime)}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiUser className="w-4 h-4 mr-2" />
                          {user.role === "client"
                            ? `Con ${appointment.employee?.name} ${appointment.employee?.lastName}`
                            : `Cliente: ${appointment.client?.name} ${appointment.client?.lastName}`}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiMapPin className="w-4 h-4 mr-2" />
                          {appointment.offering?.business?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3 w-full sm:w-auto">
                      <AppointmentStatusBadge status={appointment.status} />

                      <div className="flex space-x-2">
                        {user.role !== "client" &&
                          appointment.status === "scheduled" && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span tabIndex="0">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() =>
                                          hasStarted &&
                                          handleStatusUpdate(
                                            appointment.id,
                                            "completed",
                                          )
                                        }
                                        disabled={!hasStarted}
                                        className="text-green-600 border-green-200 hover:bg-green-500 hover:text-white disabled:hover:bg-transparent disabled:hover:text-green-600"
                                      >
                                        <FiCheck />
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!hasStarted && (
                                    <TooltipContent>
                                      <p>
                                        Solo se puede marcar como completada
                                        después de la hora de inicio.
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
                                          hasStarted &&
                                          handleStatusUpdate(
                                            appointment.id,
                                            "no-show",
                                          )
                                        }
                                        disabled={!hasStarted}
                                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-500 hover:text-white disabled:hover:bg-transparent disabled:hover:text-yellow-600"
                                      >
                                        <FiUserX />
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!hasStarted && (
                                    <TooltipContent>
                                      <p>
                                        Solo se puede marcar como "No Asistió"
                                        después de la hora de inicio.
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}

                        {appointment.status === "scheduled" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex="0">
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
                                  >
                                    <FiX className="h-4 w-4 mr-1" />
                                    Cancelar
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!canCancel && (
                                <TooltipContent>
                                  <p>No se puede cancelar con menos de 24hs.</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pagination.currentPage - 1);
                    }}
                    disabled={pagination.currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(pagination.totalPages).keys()].map((pageNumber) => (
                  <PaginationItem key={pageNumber + 1}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNumber + 1);
                      }}
                      isActive={pagination.currentPage === pageNumber + 1}
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
                      handlePageChange(pagination.currentPage + 1);
                    }}
                    disabled={pagination.currentPage === pagination.totalPages}
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
