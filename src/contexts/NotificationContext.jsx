import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { getNotifications } from "@/services/NotificationService";

const NotificationContext = createContext(undefined);

export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: "appointment_reminder",
  APPOINTMENT_CONFIRMED: "appointment_confirmed",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  NEW_APPOINTMENT_ASSIGNED: "new_appointment_assigned",
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    const count = notifications.filter((notif) => !notif.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const addNotification = useCallback((notificationData) => {
    const newNotification = {
      id: `local_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
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

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const notifyAppointmentConfirmed = useCallback(
    (appointment) =>
      addNotification({
        type: NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED,
        title: "Cita Confirmada",
        message: `Tu cita para "${appointment.offering.name}" ha sido confirmada.`,
        actionUrl: "/appointments",
      }),
    [addNotification],
  );

  const notifyAppointmentCancelled = useCallback(
    (appointment) =>
      addNotification({
        type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
        title: "Cita Cancelada",
        message: `Tu cita para "${appointment.offering.name}" ha sido cancelada.`,
        actionUrl: "/appointments",
      }),
    [addNotification],
  );

  const notifyEmployeeNewAppointment = useCallback(
    (appointment) =>
      addNotification({
        type: NOTIFICATION_TYPES.NEW_APPOINTMENT_ASSIGNED,
        title: "Nueva Cita Asignada",
        message: `Tienes una nueva cita con ${appointment.client.name} para "${appointment.offering.name}".`,
        actionUrl: "/appointments",
      }),
    [addNotification],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      notifyAppointmentConfirmed,
      notifyAppointmentCancelled,
      notifyEmployeeNewAppointment,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      notifyAppointmentConfirmed,
      notifyAppointmentCancelled,
      notifyEmployeeNewAppointment,
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
