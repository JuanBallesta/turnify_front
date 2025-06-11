import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import {
  FiBell,
  FiCalendar,
  FiUsers,
  FiSettings,
  FiAlertCircle,
  FiCheckCircle,
  FiGift,
} from "react-icons/fi";

const NotificationTest = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    addNotification,
    markAllAsRead,
    clearAllNotifications,
    notifyAppointmentConfirmed,
    notifyEmployeeNewAppointment,
    notifyAdminNewBooking,
    notifyDailyReport,
    notifySystemUpdate,
  } = useNotifications();

  // Funciones para generar notificaciones de prueba según el rol
  const generateTestNotifications = () => {
    const testNotifications = [];

    switch (user?.role) {
      case "client":
        testNotifications.push(
          () =>
            notifyAppointmentConfirmed({
              id: "test_apt_1",
              serviceName: "Corte de Cabello",
              date: "2024-06-15",
              time: "10:00",
            }),
          () =>
            addNotification({
              type: "promotion",
              title: "¡Oferta Especial!",
              message: "30% de descuento en coloraciones este fin de semana",
              priority: "medium",
              actionUrl: "/book",
            }),
        );
        break;

      case "employee":
        testNotifications.push(
          () =>
            notifyEmployeeNewAppointment(
              {
                id: "test_apt_2",
                serviceName: "Manicura",
                date: "2024-06-15",
                time: "14:30",
              },
              "Ana Martínez",
            ),
          () =>
            addNotification({
              type: "schedule_updated",
              title: "Horario Actualizado",
              message: "Tu horario para mañana ha sido modificado",
              priority: "high",
              actionUrl: "/schedule",
            }),
        );
        break;

      case "administrator":
        testNotifications.push(
          () =>
            notifyAdminNewBooking({
              id: "test_apt_3",
              serviceName: "Facial Hidratante",
              employeeName: "María González",
            }),
          () =>
            notifyDailyReport({
              appointments: 15,
              revenue: 750,
              occupancy: 85,
            }),
        );
        break;

      case "superuser":
        testNotifications.push(
          () =>
            notifySystemUpdate("2.2.0", [
              "Nuevas funcionalidades",
              "Mejoras de rendimiento",
            ]),
          () =>
            addNotification({
              type: "backup_completed",
              title: "Respaldo Completado",
              message: "El respaldo automático se completó exitosamente",
              priority: "low",
              actionUrl: "/system/backups",
            }),
        );
        break;
    }

    // Ejecutar todas las notificaciones de prueba
    testNotifications.forEach((notifFunc) => notifFunc());
  };

  const getRoleLabel = (role) => {
    const labels = {
      client: "Cliente",
      employee: "Empleado",
      administrator: "Administrador",
      superuser: "Super Usuario",
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de Notificaciones"
        description="Prueba y gestiona las notificaciones del sistema"
        breadcrumbs={[
          { label: "Panel Principal", href: "/dashboard" },
          { label: "Notificaciones", href: "/notifications-test" },
        ]}
      />

      {/* Estadísticas de Notificaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total de Notificaciones"
          value={notifications.length}
          icon={FiBell}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Sin Leer"
          value={unreadCount}
          icon={FiAlertCircle}
          trend={{ value: 3, isPositive: false }}
        />
        <StatsCard
          title="Rol Actual"
          value={getRoleLabel(user?.role)}
          icon={FiUsers}
          className="bg-violet-50 border-violet-200"
        />
      </div>

      {/* Panel de Control */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Control de Notificaciones
          </h3>
          <div className="flex items-center space-x-2">
            <FiSettings className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Configuración</span>
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-violet-700 font-semibold text-sm">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">
                {getRoleLabel(user?.role)} - {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={generateTestNotifications}
            className="flex items-center space-x-2"
          >
            <FiCheckCircle className="h-4 w-4" />
            <span>Generar Notificaciones</span>
          </Button>

          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center space-x-2"
          >
            <FiCheckCircle className="h-4 w-4" />
            <span>Marcar Todas Leídas</span>
          </Button>

          <Button
            variant="outline"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            className="flex items-center space-x-2"
          >
            <FiAlertCircle className="h-4 w-4" />
            <span>Limpiar Todas</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              addNotification({
                type: "promotion",
                title: "Notificación Personalizada",
                message:
                  "Esta es una notificación de prueba generada manualmente",
                priority: "medium",
                actionUrl: "/dashboard",
              })
            }
            className="flex items-center space-x-2"
          >
            <FiGift className="h-4 w-4" />
            <span>Notificación Manual</span>
          </Button>
        </div>
      </div>

      {/* Explicación por Rol */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">
              Notificaciones para {getRoleLabel(user?.role)}
            </h4>
            <div className="text-sm text-blue-800">
              {user?.role === "client" && (
                <p>
                  Como cliente, recibirás notificaciones sobre confirmaciones de
                  citas, recordatorios, promociones especiales y solicitudes de
                  reseñas.
                </p>
              )}
              {user?.role === "employee" && (
                <p>
                  Como empleado, recibirás notificaciones sobre nuevas citas
                  asignadas, cambios de horario, mensajes de clientes y
                  recordatorios de turnos.
                </p>
              )}
              {user?.role === "administrator" && (
                <p>
                  Como administrador, recibirás notificaciones sobre nuevas
                  reservas, reportes diarios, métricas del negocio y ausencias
                  de empleados.
                </p>
              )}
              {user?.role === "superuser" && (
                <p>
                  Como super usuario, recibirás todas las notificaciones del
                  sistema incluyendo actualizaciones, errores del sistema y
                  respaldos completados.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lista Reciente de Notificaciones */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notificaciones Recientes
          </h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.isRead
                    ? "bg-gray-50 border-gray-200"
                    : "bg-violet-50 border-violet-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {notification.title}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {notification.message}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      notification.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : notification.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {notification.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTest;
