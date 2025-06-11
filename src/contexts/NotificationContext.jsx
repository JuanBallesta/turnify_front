import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(undefined);

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  // Notificaciones para clientes
  APPOINTMENT_REMINDER: "appointment_reminder",
  APPOINTMENT_CONFIRMED: "appointment_confirmed",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  APPOINTMENT_COMPLETED: "appointment_completed",
  PROMOTION: "promotion",
  PAYMENT_SUCCESS: "payment_success",
  REVIEW_REQUEST: "review_request",

  // Notificaciones para empleados
  NEW_APPOINTMENT_ASSIGNED: "new_appointment_assigned",
  APPOINTMENT_CANCELLED_BY_CLIENT: "appointment_cancelled_by_client",
  SCHEDULE_UPDATED: "schedule_updated",
  CLIENT_MESSAGE: "client_message",
  SHIFT_REMINDER: "shift_reminder",

  // Notificaciones para administradores
  NEW_BOOKING: "new_booking",
  EMPLOYEE_ABSENT: "employee_absent",
  DAILY_REPORT: "daily_report",
  NEW_EMPLOYEE_REGISTERED: "new_employee_registered",
  BUSINESS_METRICS: "business_metrics",

  // Notificaciones del sistema (solo para super usuarios)
  SYSTEM_UPDATE: "system_update",
  NEW_MESSAGE: "new_message",
  SYSTEM_ERROR: "system_error",
  BACKUP_COMPLETED: "backup_completed",
};

// Mock de notificaciones iniciales
const mockNotifications = [
  {
    id: "notif_1",
    type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
    title: "Recordatorio de Cita",
    message: "Tu cita de 'Corte de Cabello' es mañana a las 10:00 AM",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    isRead: false,
    priority: "medium",
    actionUrl: "/appointments",
    data: {
      appointmentId: "apt1",
      serviceName: "Corte de Cabello",
      date: "2024-06-10",
      time: "10:00",
    },
  },
  {
    id: "notif_2",
    type: NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED,
    title: "Cita Confirmada",
    message:
      "Tu cita para 'Manicura' ha sido confirmada para el 12 de junio a las 3:30 PM",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
    isRead: false,
    priority: "high",
    actionUrl: "/appointments",
    data: {
      appointmentId: "apt2",
      serviceName: "Manicura",
    },
  },
  {
    id: "notif_3",
    type: NOTIFICATION_TYPES.PROMOTION,
    title: "¡Oferta Especial!",
    message: "20% de descuento en servicios de coloración durante esta semana",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    isRead: true,
    priority: "low",
    actionUrl: "/book",
    data: {
      discountCode: "COLOR20",
      validUntil: "2024-06-15",
    },
  },
  {
    id: "notif_4",
    type: NOTIFICATION_TYPES.SYSTEM_UPDATE,
    title: "Nueva Función Disponible",
    message: "Ahora puedes subir tu foto de perfil desde la configuración",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
    isRead: true,
    priority: "low",
    actionUrl: "/profile",
    data: {},
  },
];

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getNotificationsByRole = (userRole) => {
    // ... tu lógica aquí ...
  };

  const generateRoleSpecificNotifications = (user) => {
    // ... tu lógica aquí ...
  };

  // CAMBIO CLAVE: Todas las funciones que se pasan al 'value' del provider
  // deben estar envueltas en useCallback para mantener una referencia estable.

  const updateUnreadCount = useCallback(() => {
    setNotifications((currentNotifications) => {
      const count = currentNotifications.filter(
        (notif) => !notif.isRead,
      ).length;
      setUnreadCount(count);
      return currentNotifications;
    });
  }, []);

  const addNotification = useCallback((notificationData) => {
    const newNotification = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: "medium",
      ...notificationData,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification;
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((notif) => notif.type === type);
    },
    [notifications],
  );

  const getRecentNotifications = useCallback(() => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(
      (notif) => new Date(notif.timestamp) > yesterday,
    );
  }, [notifications]);

  const notifyAppointmentReminder = useCallback(
    (appointment) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyAppointmentConfirmed = useCallback(
    (appointment) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyAppointmentCancelled = useCallback(
    (appointment) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyEmployeeNewAppointment = useCallback(
    (appointment, employeeName) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyEmployeeAppointmentCancelled = useCallback(
    (appointment) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyScheduleUpdate = useCallback(
    (message) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyAdminNewBooking = useCallback(
    (appointment) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyEmployeeAbsent = useCallback(
    (employeeName, reason = "") =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyDailyReport = useCallback(
    (stats) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifyBusinessMetrics = useCallback(
    (metrics) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifySystemUpdate = useCallback(
    (version, features) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );
  const notifySystemError = useCallback(
    (error) =>
      addNotification({
        /*...*/
      }),
    [addNotification],
  );

  useEffect(() => {
    if (user) {
      // ... tu lógica de inicialización ...
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    updateUnreadCount();
  }, [notifications, updateUnreadCount]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      // ... tu lógica de notificaciones en tiempo real ...
    }, 30000);
    return () => clearInterval(interval);
  }, [user, addNotification]); // BUENA PRÁCTICA: añadir `addNotification` aquí

  // CAMBIO CLAVE: Envolver el objeto `value` en useMemo
  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      getNotificationsByType,
      getRecentNotifications,
      getNotificationsByRole,
      notifyAppointmentReminder,
      notifyAppointmentConfirmed,
      notifyAppointmentCancelled,
      notifyEmployeeNewAppointment,
      notifyEmployeeAppointmentCancelled,
      notifyScheduleUpdate,
      notifyAdminNewBooking,
      notifyEmployeeAbsent,
      notifyDailyReport,
      notifyBusinessMetrics,
      notifySystemUpdate,
      notifySystemError,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      getNotificationsByType,
      getRecentNotifications,
      notifyAppointmentReminder,
      notifyAppointmentConfirmed,
      notifyAppointmentCancelled,
      notifyEmployeeNewAppointment,
      notifyEmployeeAppointmentCancelled,
      notifyScheduleUpdate,
      notifyAdminNewBooking,
      notifyEmployeeAbsent,
      notifyDailyReport,
      notifyBusinessMetrics,
      notifySystemUpdate,
      notifySystemError,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications debe ser usado dentro de un NotificationProvider",
    );
  }
  return context;
};
