import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [services, setServices] = useState();
  const [businesses, setBusinesses] = useState();
  const [employees, setEmployees] = useState();
  const [appointments, setAppointments] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCallbacks, setNotificationCallbacks] = useState({});

  // CAMBIO CLAVE: Envolver las funciones en useCallback para estabilizarlas
  const registerNotificationCallbacks = useCallback((callbacks) => {
    setNotificationCallbacks(callbacks);
  }, []);

  const createAppointment = useCallback(
    async (appointmentData) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const service = services.find(
          (s) => s.id === appointmentData.serviceId,
        );
        const business = businesses.find(
          (b) => b.id === appointmentData.businessId,
        );
        const employee = employees.find(
          (e) => e.id === appointmentData.employeeId,
        );

        const newAppointment = {
          id: `apt${Date.now()}`,
          clientId: user.id,
          clientName: user.name,
          employeeId: appointmentData.employeeId,
          employeeName: employee?.name,
          serviceId: appointmentData.serviceId,
          serviceName: service?.name,
          serviceDescription: service?.description,
          businessId: appointmentData.businessId,
          businessName: business?.name,
          date: appointmentData.date,
          time: appointmentData.time,
          duration: service?.duration,
          price: service?.price,
          status: "scheduled",
          notes: appointmentData.notes || "",
          createdAt: new Date().toISOString(),
        };

        setAppointments((prev) => [...prev, newAppointment]);

        if (notificationCallbacks.notifyAppointmentConfirmed) {
          notificationCallbacks.notifyAppointmentConfirmed(newAppointment);
        }
        if (notificationCallbacks.notifyEmployeeNewAppointment) {
          notificationCallbacks.notifyEmployeeNewAppointment(
            newAppointment,
            employee?.name,
          );
        }
        if (notificationCallbacks.notifyAdminNewBooking) {
          notificationCallbacks.notifyAdminNewBooking(newAppointment);
        }
        return newAppointment;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [services, businesses, employees, user, notificationCallbacks],
  );

  const cancelAppointment = useCallback(
    async (appointmentId) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const appointmentToCancel = appointments.find(
          (apt) => apt.id === appointmentId,
        );
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt,
          ),
        );
        if (appointmentToCancel) {
          if (notificationCallbacks.notifyAppointmentCancelled) {
            notificationCallbacks.notifyAppointmentCancelled(
              appointmentToCancel,
            );
          }
          if (notificationCallbacks.notifyEmployeeAppointmentCancelled) {
            notificationCallbacks.notifyEmployeeAppointmentCancelled(
              appointmentToCancel,
            );
          }
        }
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [appointments, notificationCallbacks],
  );

  const getAvailableSlots = useCallback(
    (businessId, employeeId, date) => {
      const business = businesses.find((b) => b.id === businessId);
      const employee = employees.find((e) => e.id === employeeId);
      if (!business || !employee) return [];
      const dateObj = new Date(date);
      const dayIndex = dateObj.getDay();
      const dayMapping = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayOfWeek = dayMapping[dayIndex];
      const businessHours = business.workingHours[dayOfWeek];
      const employeeHours = employee.workingHours[dayOfWeek];
      if (
        !businessHours ||
        !employeeHours ||
        businessHours.closed ||
        employeeHours.closed
      ) {
        return [];
      }
      const slots = [];
      const startHour = Math.max(
        parseInt(businessHours.open.split(":")[0]),
        parseInt(employeeHours.open.split(":")[0]),
      );
      const endHour = Math.min(
        parseInt(businessHours.close.split(":")[0]),
        parseInt(employeeHours.close.split(":")[0]),
      );
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`);
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
      return slots;
    },
    [businesses, employees],
  );

  // CAMBIO CLAVE: Envolver el objeto `value` en useMemo
  const value = useMemo(
    () => ({
      services,
      businesses,
      employees,
      appointments,
      isLoading,
      createAppointment,
      cancelAppointment,
      getAvailableSlots,
      registerNotificationCallbacks,
      setServices,
      setBusinesses,
      setEmployees,
      setAppointments,
    }),
    [
      services,
      businesses,
      employees,
      appointments,
      isLoading,
      createAppointment,
      cancelAppointment,
      getAvailableSlots,
      registerNotificationCallbacks,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp debe ser usado dentro de un AppProvider");
  }
  return context;
};
