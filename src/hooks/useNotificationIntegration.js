import { useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";

// Hook personalizado para integrar notificaciones automáticas
export const useNotificationIntegration = () => {
  const { user } = useAuth();
  const { registerNotificationCallbacks } = useApp();
  const {
    notifyAppointmentConfirmed,
    notifyAppointmentCancelled,
    notifyEmployeeNewAppointment,
    notifyEmployeeAppointmentCancelled,
    notifyAdminNewBooking,
    notifyDailyReport,
    notifyBusinessMetrics,
    notifySystemUpdate,
  } = useNotifications();

  useEffect(() => {
    if (user && registerNotificationCallbacks) {
      // Registrar los callbacks de notificación en AppContext
      const callbacks = {
        notifyAppointmentConfirmed,
        notifyAppointmentCancelled,
        notifyEmployeeNewAppointment,
        notifyEmployeeAppointmentCancelled,
        notifyAdminNewBooking,
      };

      registerNotificationCallbacks(callbacks);

      // Generar notificaciones periódicas específicas por rol
      const generatePeriodicNotifications = () => {
        const now = new Date();
        const hour = now.getHours();

        switch (user.role) {
          case "administrator":
            // Reporte diario a las 9 AM
            if (hour === 9) {
              const mockStats = {
                appointments: Math.floor(Math.random() * 20) + 5,
                revenue: Math.floor(Math.random() * 1000) + 500,
                occupancy: Math.floor(Math.random() * 30) + 70,
              };
              notifyDailyReport(mockStats);
            }

            // Métricas de negocio cada 4 horas
            if (hour % 4 === 0) {
              const mockMetrics = {
                occupancy: Math.floor(Math.random() * 20) + 80,
                satisfaction: (Math.random() * 1.5 + 3.5).toFixed(1),
                newClients: Math.floor(Math.random() * 5) + 2,
              };
              notifyBusinessMetrics(mockMetrics);
            }
            break;

          case "superuser":
            // Notificaciones del sistema los lunes a las 8 AM
            if (now.getDay() === 1 && hour === 8) {
              const versions = ["2.1.5", "2.1.6", "2.2.0"];
              const randomVersion =
                versions[Math.floor(Math.random() * versions.length)];
              notifySystemUpdate(randomVersion, [
                "Mejoras de seguridad",
                "Nuevas funcionalidades",
              ]);
            }
            break;

          case "employee":
            // Recordatorio de turno 1 hora antes (ejemplo: turno a las 9 AM, recordatorio a las 8 AM)
            if (hour === 8) {
              // Este sería más específico en una implementación real
              // notifyShiftReminder(employee, nextShift);
            }
            break;
        }
      };

      // Configurar intervalo para notificaciones periódicas (cada hora)
      const interval = setInterval(
        generatePeriodicNotifications,
        60 * 60 * 1000,
      );

      // Ejecutar después de 5 segundos para dar tiempo a que se inicialice todo
      const timeoutId = setTimeout(generatePeriodicNotifications, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeoutId);
      };
    }
  }, [user, registerNotificationCallbacks]);

  return {
    // Funciones útiles para generar notificaciones manualmente
    sendCustomNotification: {
      appointmentReminder: notifyAppointmentConfirmed,
      employeeScheduleUpdate: notifyEmployeeAppointmentCancelled,
      businessReport: notifyDailyReport,
      systemAlert: notifySystemUpdate,
    },
  };
};

export default useNotificationIntegration;
