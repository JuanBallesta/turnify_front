import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Avatar, AvatarFallback } from "./avatar";
import { EmptyState } from "./empty-state";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiEdit,
  FiX,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

// --- 1. NUEVO COMPONENTE DE AYUDA PARA TRADUCIR Y DAR ESTILO AL ESTADO ---
const AppointmentStatusBadge = ({ status }) => {
  const statusInfo = {
    scheduled: {
      label: "Programada",
      className: "border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    completed: {
      label: "Completada",
      className:
        "border-green-200 bg-green-100 text-green-800 hover:bg-green-200",
    },
    cancelled: {
      label: "Cancelada",
      className: "border-red-200 bg-red-100 text-red-800 hover:bg-red-200",
    },
    "no-show": {
      label: "No Asistió",
      className:
        "border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
  };
  const current = statusInfo[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge
      className={cn(
        "font-medium border",
        current.className,
        "transition-colors",
      )}
    >
      {current.label}
    </Badge>
  );
};

const UpcomingAppointments = ({
  appointments = [],
  maxItems = 5,
  onViewAll,
}) => {
  const upcomingAppointments = appointments.slice(0, maxItems);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === tomorrow.toDateString()) return "Mañana";

    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FiCalendar />
            <span>Próximas Citas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FiCalendar}
            title="No tienes citas próximas"
            description="Tu agenda está libre. ¡Reserva un nuevo servicio!"
            action="Reservar Cita"
            onAction={() => (window.location.href = "/book")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FiCalendar className="w-5 h-5" />
            <span className="ml-2">Próximas Citas</span>
          </CardTitle>
          {onViewAll && (
            <Button variant="link" size="sm" onClick={onViewAll}>
              Ver todas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingAppointments.map((appointment) => {
          const employeeName =
            `${appointment.employee?.name || ""} ${appointment.employee?.lastName || ""}`.trim();
          const serviceName =
            appointment.offering?.name || "Servicio no especificado";
          // --- 2. EXTRAEMOS LOS DATOS DEL NEGOCIO ---
          const businessName =
            appointment.offering?.business?.name || "Negocio no disponible";
          const businessAddress = appointment.offering?.business?.address || "";

          return (
            <div
              key={appointment.id}
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow space-y-3"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-lg text-gray-900">
                  {serviceName}
                </h4>
                {/* 3. USAMOS EL NUEVO COMPONENTE DE BADGE */}
                <AppointmentStatusBadge status={appointment.status} />
              </div>

              <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                <div className="flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {formatDate(appointment.startTime)} a las{" "}
                    {formatTime(appointment.startTime)}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Con {employeeName || "Profesional"}</span>
                </div>
                {/* 4. MOSTRAMOS EL NEGOCIO Y LA DIRECCIÓN */}
                <div className="flex items-center">
                  <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    En {businessName} ({businessAddress})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export { UpcomingAppointments };
