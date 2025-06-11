import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiAward,
  FiHeart,
} from "react-icons/fi";

const ProfileStats = ({ user, appointments = [] }) => {
  // Calcular estadísticas del usuario
  const userAppointments = appointments.filter((apt) =>
    user.role === "client"
      ? apt.clientId === user.id
      : apt.employeeId === user.id,
  );

  const completedAppointments = userAppointments.filter(
    (apt) => apt.status === "completed",
  );
  const totalSpent = completedAppointments.reduce(
    (sum, apt) => sum + (apt.price || 0),
    0,
  );
  const averageRating = 4.8; // Simulado
  const favoriteService = "Corte de Cabello"; // Simulado

  const stats = [
    {
      title:
        user.role === "client" ? "Citas Realizadas" : "Servicios Prestados",
      value: completedAppointments.length,
      icon: FiCalendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: user.role === "client" ? "Total Gastado" : "Ingresos Generados",
      value: `$${totalSpent}`,
      icon: FiDollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title:
        user.role === "client"
          ? "Calificación Promedio"
          : "Rating como Profesional",
      value: averageRating.toFixed(1),
      icon: FiAward,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      suffix: "★",
    },
    {
      title:
        user.role === "client" ? "Servicio Favorito" : "Especialidad Principal",
      value: favoriteService,
      icon: FiHeart,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      isText: true,
    },
  ];

  const achievements = [
    {
      name: "Cliente Frecuente",
      description: "5+ citas realizadas",
      earned: completedAppointments.length >= 5,
    },
    {
      name: "Buen Cliente",
      description: "Calificación 4.5+",
      earned: averageRating >= 4.5,
    },
    { name: "Fiel Usuario", description: "Miembro por 3+ meses", earned: true },
    { name: "Reseñador", description: "5+ reseñas escritas", earned: false },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FiTrendingUp className="w-5 h-5" />
            <span>Estadísticas de Actividad</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-yellow-500 ml-1">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logros y badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FiAward className="w-5 h-5" />
            <span>Logros y Reconocimientos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-all ${
                  achievement.earned
                    ? "border-violet-300 bg-violet-50"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4
                      className={`font-medium ${
                        achievement.earned ? "text-violet-900" : "text-gray-600"
                      }`}
                    >
                      {achievement.name}
                    </h4>
                    <p
                      className={`text-sm ${
                        achievement.earned ? "text-violet-700" : "text-gray-500"
                      }`}
                    >
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <div className="p-2 bg-violet-600 rounded-full">
                      <FiAward className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg border border-violet-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-600 rounded-full">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-violet-900">¡Sigue así!</h4>
                <p className="text-sm text-violet-700">
                  {user.role === "client"
                    ? `Reserva ${5 - completedAppointments.length} cita(s) más para desbloquear el siguiente logro.`
                    : "Continúa brindando excelente servicio para ganar más reconocimientos."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FiClock className="w-5 h-5" />
            <span>Actividad Reciente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userAppointments.slice(0, 3).map((appointment, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
              >
                <div className="p-2 bg-violet-100 rounded-lg">
                  <FiCalendar className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {appointment.serviceName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString("es-ES")} -{" "}
                    {appointment.time}
                  </p>
                </div>
                <Badge
                  variant={
                    appointment.status === "completed" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {appointment.status === "completed"
                    ? "Completada"
                    : "Programada"}
                </Badge>
              </div>
            ))}

            {userAppointments.length === 0 && (
              <div className="text-center py-8">
                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay actividad reciente</p>
                <p className="text-sm text-gray-500">
                  {user.role === "client"
                    ? "Reserva tu primera cita para ver tu actividad aquí"
                    : "Tus servicios aparecerán aquí una vez que tengas citas asignadas"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ProfileStats };
