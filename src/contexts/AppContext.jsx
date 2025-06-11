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

// Datos de negocios
const mockBusinesses = [
  {
    id: "business1",
    name: "Bella Vista Salon & Spa",
    description: "Salón de belleza premium con servicios completos",
    address: "Av. Principal 123, Centro",
    phone: "+1234567890",
    email: "info@bellavista.com",
    rating: 4.8,
    totalReviews: 245,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400",
    workingHours: {
      monday: { open: "09:00", close: "19:00" },
      tuesday: { open: "09:00", close: "19:00" },
      wednesday: { open: "09:00", close: "19:00" },
      thursday: { open: "09:00", close: "20:00" },
      friday: { open: "09:00", close: "20:00" },
      saturday: { open: "08:00", close: "18:00" },
      sunday: { open: "10:00", close: "16:00" },
    },
    services: ["1", "2", "3", "4", "5", "6", "7", "8"],
    isActive: true,
  },
  {
    id: "business2",
    name: "Urban Style Studio",
    description: "Estudio moderno especializado en cortes de vanguardia",
    address: "Calle Moderna 456, Zona Norte",
    phone: "+1234567891",
    email: "hola@urbanstyle.com",
    rating: 4.6,
    totalReviews: 189,
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400",
    workingHours: {
      monday: { closed: true },
      tuesday: { open: "10:00", close: "18:00" },
      wednesday: { open: "10:00", close: "18:00" },
      thursday: { open: "10:00", close: "20:00" },
      friday: { open: "10:00", close: "20:00" },
      saturday: { open: "09:00", close: "17:00" },
      sunday: { open: "11:00", close: "15:00" },
    },
    services: ["1", "2", "7"],
    isActive: true,
  },
  {
    id: "business3",
    name: "Relax Wellness Center",
    description: "Centro de bienestar y relajación",
    address: "Plaza del Bienestar 789, Zona Sur",
    phone: "+1234567892",
    email: "contacto@relaxwellness.com",
    rating: 4.9,
    totalReviews: 156,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
    workingHours: {
      monday: { open: "08:00", close: "20:00" },
      tuesday: { open: "08:00", close: "20:00" },
      wednesday: { open: "08:00", close: "20:00" },
      thursday: { open: "08:00", close: "20:00" },
      friday: { open: "08:00", close: "20:00" },
      saturday: { open: "09:00", close: "19:00" },
      sunday: { open: "10:00", close: "18:00" },
    },
    services: ["6", "7", "8"],
    isActive: true,
  },
];

// Datos de servicios expandidos
const mockServices = [
  {
    id: "1",
    name: "Corte de Cabello",
    description: "Corte profesional y peinado para damas y caballeros",
    duration: 45,
    price: 35,
    businessId: "business1",
    isActive: true,
    createdAt: "2024-01-01",
    category: "Cabello",
    tags: ["corte", "peinado", "hombre", "mujer"],
    rating: 4.8,
    totalReviews: 124,
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=300",
  },
  {
    id: "2",
    name: "Coloración",
    description:
      "Servicio completo de coloración del cabello con productos premium",
    duration: 120,
    price: 85,
    businessId: "business1",
    isActive: true,
    createdAt: "2024-01-01",
    category: "Cabello",
    tags: ["color", "tinte", "mechas", "retoque"],
    rating: 4.9,
    totalReviews: 89,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300",
  },
  {
    id: "3",
    name: "Manicura",
    description: "Cuidado profesional de uñas y esmaltado duradero",
    duration: 30,
    price: 25,
    businessId: "business1",
    isActive: true,
    createdAt: "2024-01-01",
    category: "Uñas",
    tags: ["manicura", "esmalte", "cuidado"],
    rating: 4.7,
    totalReviews: 156,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300",
  },
  {
    id: "4",
    name: "Pedicura",
    description: "Tratamiento completo de pies con relajación incluida",
    duration: 60,
    price: 40,
    businessId: "business1",
    isActive: true,
    createdAt: "2024-01-01",
    category: "Uñas",
    tags: ["pedicura", "pies", "relajación"],
    rating: 4.6,
    totalReviews: 98,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300",
  },
  {
    id: "5",
    name: "Facial Hidratante",
    description: "Tratamiento facial profundo con productos naturales",
    duration: 75,
    price: 65,
    businessId: "business1",
    isActive: true,
    createdAt: "2024-01-01",
    category: "Facial",
    tags: ["facial", "hidratante", "natural", "antiarrugas"],
    rating: 4.8,
    totalReviews: 112,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300",
  },
  {
    id: "6",
    name: "Masaje Relajante",
    description: "Masaje terapéutico para aliviar tensiones y estrés",
    duration: 90,
    price: 75,
    businessId: "business3",
    isActive: true,
    createdAt: "2024-01-01",
    category: "Bienestar",
    tags: ["masaje", "relajante", "terapéutico", "estrés"],
    rating: 4.9,
    totalReviews: 203,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300",
  },
  {
    id: "7",
    name: "Depilación con Cera",
    description: "Depilación profesional con cera hipoalergénica",
    duration: 45,
    price: 30,
    businessId: "business1",
    isActive: true,
    createdAt: "2024-01-01",
    category: "Depilación",
    tags: ["depilación", "cera", "hipoalergénica"],
    rating: 4.5,
    totalReviews: 87,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300",
  },
  {
    id: "8",
    name: "Tratamiento Capilar",
    description: "Tratamiento intensivo para fortalecer y nutrir el cabello",
    duration: 60,
    price: 55,
    businessId: "business1",
    isActive: true,
    createdAt: "2024-01-01",
    category: "Cabello",
    tags: ["tratamiento", "capilar", "nutritivo", "fortalecedor"],
    rating: 4.7,
    totalReviews: 134,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300",
  },
];

// Datos de empleados expandidos
const mockEmployees = [
  {
    id: "emp1",
    name: "María González",
    specialties: ["Cabello", "Coloración"],
    rating: 4.9,
    experience: "5 años",
    businessId: "business1",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150",
    workingHours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "08:00", close: "16:00" },
    },
  },
  {
    id: "emp2",
    name: "Carlos Rodríguez",
    specialties: ["Cortes", "Barba"],
    rating: 4.8,
    experience: "7 años",
    businessId: "business1",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    workingHours: {
      tuesday: { open: "10:00", close: "19:00" },
      wednesday: { open: "10:00", close: "19:00" },
      thursday: { open: "10:00", close: "19:00" },
      friday: { open: "10:00", close: "19:00" },
      saturday: { open: "09:00", close: "17:00" },
    },
  },
  {
    id: "emp3",
    name: "Ana Martínez",
    specialties: ["Uñas", "Manicura", "Pedicura"],
    rating: 4.7,
    experience: "4 años",
    businessId: "business1",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    workingHours: {
      monday: { open: "10:00", close: "18:00" },
      tuesday: { open: "10:00", close: "18:00" },
      wednesday: { open: "10:00", close: "18:00" },
      thursday: { open: "10:00", close: "18:00" },
      friday: { open: "10:00", close: "18:00" },
    },
  },
];

// Mock de citas existentes
const mockAppointments = [
  {
    id: "apt1",
    clientId: "1",
    clientName: "Juan Cliente",
    employeeId: "emp1",
    employeeName: "María González",
    serviceId: "1",
    serviceName: "Corte de Cabello",
    serviceDescription: "Corte profesional y peinado",
    businessId: "business1",
    businessName: "Bella Vista Salon & Spa",
    date: "2024-06-10",
    time: "10:00",
    duration: 45,
    price: 35,
    status: "scheduled",
    notes: "Cliente prefiere corte clásico",
    createdAt: "2024-06-07T10:00:00Z",
  },
  {
    id: "apt2",
    clientId: "1",
    clientName: "Juan Cliente",
    employeeId: "emp3",
    employeeName: "Ana Martínez",
    serviceId: "3",
    serviceName: "Manicura",
    serviceDescription: "Cuidado profesional de uñas",
    businessId: "business1",
    businessName: "Bella Vista Salon & Spa",
    date: "2024-06-12",
    time: "15:30",
    duration: 30,
    price: 25,
    status: "scheduled",
    notes: "",
    createdAt: "2024-06-07T14:30:00Z",
  },
];

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [services, setServices] = useState(mockServices);
  const [businesses, setBusinesses] = useState(mockBusinesses);
  const [employees, setEmployees] = useState(mockEmployees);
  const [appointments, setAppointments] = useState(mockAppointments);
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
