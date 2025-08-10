import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyAppointments,
  updateAppointment,
  getAppointmentStats,
} from "@/services/AppointmentService";
import { CancellationModal } from "@/components/modals/CancellationModal";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/tooltip";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchBox } from "@/components/ui/search-box";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FiAlertCircle } from "react-icons/fi";

// Icons
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
  FiUserX,
  FiMapPin,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [adminView, setAdminView] = useState("business");
  const isAdmin = user?.role === "administrator";

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const loadAppointments = (page = 1) => {
    setIsLoading(true);
    const viewContext = isAdmin ? adminView : undefined;
    getMyAppointments(page, activeTab, searchTerm, dateFilter, viewContext)
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
    setIsLoadingStats(true);
    const viewContext = isAdmin ? adminView : undefined;
    getAppointmentStats(viewContext)
      .then(setStats)
      .catch(() => setError("No se pudieron cargar las estadísticas."))
      .finally(() => setIsLoadingStats(false));
  };

  useEffect(() => {
    if (user) {
      loadAppointments(1);
      loadStats();
    }
  }, [user, activeTab, searchTerm, dateFilter, adminView]);

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= pagination.totalPages &&
      newPage !== pagination.currentPage
    ) {
      loadAppointments(newPage);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus, reason = "") => {
    setIsActionLoading(true);
    try {
      const payload = { status: newStatus };
      if (newStatus === "cancelled" && reason) {
        payload.cancellationReason = reason;
      }
      await updateAppointment(appointmentId, payload);
      loadAppointments(pagination.currentPage);
      loadStats();
    } catch (error) {
      alert("Error al actualizar el estado de la cita.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const openCancelModal = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleConfirmCancellation = async (reason) => {
    if (!appointmentToCancel) return;
    await handleStatusUpdate(appointmentToCancel.id, "cancelled", reason);
    setShowCancelModal(false);
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
  if (isLoading && pagination.currentPage === 1)
    return (
      <>
        <div className="p-6 text-center">
          <LoadingSpinner size="lg" />
        </div>
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
          title={
            isAdmin && adminView === "personal"
              ? "Mis Citas Personales"
              : "Gestión de Citas"
          }
          description="Visualiza y administra todas las citas programadas"
        />
        {isAdmin && (
          <Tabs value={adminView} onValueChange={setAdminView}>
            <TabsList>
              <TabsTrigger value="business">Citas del Negocio</TabsTrigger>
              <TabsTrigger value="personal">Mis Citas Personales</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Citas"
            value={stats.total}
            isLoading={isLoadingStats}
            icon={FiCalendar}
          />
          <StatsCard
            title="Programadas"
            value={stats.scheduled}
            isLoading={isLoadingStats}
            icon={FiClock}
            variant="primary"
          />
          <StatsCard
            title="Completadas"
            value={stats.completed}
            isLoading={isLoadingStats}
            icon={FiCheck}
            variant="success"
          />
          <StatsCard
            title="Canceladas / Ausentes"
            value={stats.cancelled + (stats["no-show"] || 0)}
            isLoading={isLoadingStats}
            icon={FiX}
            variant="danger"
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchBox
                  placeholder="Buscar por servicio, cliente..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
              </div>
              <Select value={activeTab} onValueChange={setActiveTab}>
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
              const employeeName =
                `${appointment.employee?.name || ""} ${appointment.employee?.lastName || ""}`.trim();
              const clientName =
                `${appointment.client?.name || ""} ${appointment.client?.lastName || ""}`.trim();
              let avatarContact, avatarName;
              if (
                user.role === "client" ||
                (isAdmin && adminView === "personal")
              ) {
                avatarContact = appointment.employee;
                avatarName = employeeName;
              } else {
                avatarContact = appointment.client;
                avatarName = clientName;
              }
              const photoUrl = avatarContact?.photo
                ? `${API_URL}${avatarContact.photo}`
                : undefined;
              const canCancel =
                (new Date(appointment.startTime) - new Date()) /
                  (1000 * 60 * 60) >
                24;
              const hasStarted = new Date() >= new Date(appointment.startTime);

              const getCancellationMessage = () => {
                if (!appointment.cancelledBy) return null;

                let cancelledByName = "";
                if (appointment.cancelledBy === "client") {
                  // Si canceló el cliente, usamos el nombre del cliente
                  cancelledByName = clientName || "el cliente";
                } else {
                  // 'staff'
                  // Si canceló el personal, usamos el nombre del empleado
                  cancelledByName = employeeName || "el personal";
                }

                return `Cancelado por: ${cancelledByName}`;
              };

              return (
                <Card key={appointment.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={photoUrl} />
                        <AvatarFallback>
                          {getInitials(avatarName)}
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
                        {user.role === "client" ||
                        (isAdmin && adminView === "personal") ? (
                          <p className="text-sm text-gray-500 flex items-center">
                            <FiUser className="w-4 h-4 mr-2" />
                            Con:{" "}
                            <span className="font-medium ml-1">
                              {employeeName}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 flex items-center">
                            <FiUser className="w-4 h-4 mr-2" />
                            Cliente:{" "}
                            <span className="font-medium ml-1">
                              {clientName}
                            </span>
                          </p>
                        )}
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiMapPin className="w-4 h-4 mr-2" />
                          {appointment.offering?.business?.name}
                        </p>
                        {appointment.status === "cancelled" && (
                          <div className=" text-red-800 text-sm">
                            <div className="font-semibold flex items-center">
                              <FiAlertCircle className="w-4 h-4 mr-2" />
                              <p>
                                Motivo:{" "}
                                <span className="font-normal italic">
                                  "
                                  {appointment.cancellationReason ||
                                    "No especificado"}{" "}
                                  " - {getCancellationMessage()}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3 w-full sm:w-auto">
                      <StatusBadge status={appointment.status} />
                      <div className="flex space-x-2">
                        {user.role !== "client" &&
                          appointment.status === "scheduled" && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span tabIndex={0}>
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
                                        después de la hora.
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span tabIndex={0}>
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
                                        después de la hora.
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
                                <span tabIndex={0}>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      canCancel && openCancelModal(appointment)
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

      <CancellationModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={handleConfirmCancellation}
        isCancelling={isActionLoading}
      />
    </>
  );
};

export default Appointments;
