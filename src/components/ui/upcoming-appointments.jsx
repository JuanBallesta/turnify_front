import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "./empty-state";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMoreVertical,
  FiEdit,
  FiX,
} from "react-icons/fi";

const UpcomingAppointments = ({
  appointments = [],
  showActions = true,
  maxItems = 5,
  onEditAppointment,
  onCancelAppointment,
  onViewAll,
}) => {
  // Filtrar y ordenar citas próximas
  const upcomingAppointments = appointments
    .filter((apt) => apt.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`),
    )
    .slice(0, maxItems);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Mañana";
    } else {
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatDateTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    return {
      date: formatDate(dateStr),
      time: timeStr,
      fullDate: date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  const getTimeUntilAppointment = (dateStr, timeStr) => {
    const appointmentDate = new Date(`${dateStr} ${timeStr}`);
    const now = new Date();
    const diffMs = appointmentDate - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) return "Pasado";
    if (diffHours < 1) return "En breve";
    if (diffHours < 24) return `En ${diffHours}h`;

    const diffDays = Math.ceil(diffHours / 24);
    return `En ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  };

  if (upcomingAppointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FiCalendar className="w-5 h-5" />
            <span>Próximas Citas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FiCalendar}
            title="No tienes citas próximas"
            description="Reserva una nueva cita para ver tus próximos servicios aquí."
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
            <span>Próximas Citas</span>
            <Badge variant="secondary" className="ml-2">
              {upcomingAppointments.length}
            </Badge>
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              Ver todas
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {upcomingAppointments.map((appointment) => {
          const dateTime = formatDateTime(appointment.date, appointment.time);
          const timeUntil = getTimeUntilAppointment(
            appointment.date,
            appointment.time,
          );

          return (
            <div
              key={appointment.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  {/* Servicio y estado */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {appointment.serviceName}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={appointment.status} />
                      <Badge variant="outline" className="text-xs">
                        {timeUntil}
                      </Badge>
                    </div>
                  </div>

                  {/* Fecha y hora */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{dateTime.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>{dateTime.time}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>{appointment.duration} min</span>
                  </div>

                  {/* Empleado y negocio */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {appointment.employeeName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {appointment.employeeName}
                      </span>
                    </div>

                    {appointment.businessName && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <FiMapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">
                          {appointment.businessName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      ${appointment.price}
                    </span>

                    {/* Acciones */}
                    {showActions && (
                      <div className="flex items-center space-x-2">
                        {onEditAppointment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditAppointment(appointment)}
                            className="text-violet-600 hover:text-violet-700"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Button>
                        )}
                        {onCancelAppointment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCancelAppointment(appointment)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Notas si existen */}
                  {appointment.notes && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mt-2">
                      <strong>Notas:</strong> {appointment.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Botón para ver más si hay más citas */}
        {appointments.filter((apt) => apt.status === "scheduled").length >
          maxItems && (
          <div className="text-center pt-4 border-t">
            <Button variant="outline" onClick={onViewAll}>
              Ver{" "}
              {appointments.filter((apt) => apt.status === "scheduled").length -
                maxItems}{" "}
              cita(s) más
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { UpcomingAppointments };
