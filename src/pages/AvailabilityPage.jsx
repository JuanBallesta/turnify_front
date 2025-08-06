import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getEmployees } from "@/services/EmployeeService";
import { getDailyScheduleForEmployees } from "@/services/AvailabilityService";
import Layout from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  User,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- Sub-componente para la Tarjeta de Empleado en la lista ---
const EmployeeListItem = ({ employee, isSelected, onSelect }) => {
  const photoUrl = employee.photo ? `${API_URL}${employee.photo}` : undefined;
  const getInitials = (name) => {
    if (!name) return "?";
    const n = name.trim().split(" ");
    if (n.length > 1) return `${n[0][0]}${n[n.length - 1][0]}`.toUpperCase();
    return n[0].substring(0, 2).toUpperCase();
  };

  return (
    <div
      onClick={() => onSelect(employee)}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all flex items-center space-x-3",
        isSelected
          ? "border-violet-500 bg-violet-50 shadow-md"
          : "bg-white hover:border-gray-300 hover:shadow-sm",
      )}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={photoUrl} />
        <AvatarFallback>
          {getInitials(`${employee.name} ${employee.lastName}`)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">
          {employee.name} {employee.lastName}
        </h4>
        <p className="text-xs text-gray-500">
          {employee.userType?.name || "Empleado"}
        </p>
      </div>
    </div>
  );
};

// --- Sub-componente para la Tarjeta de Horario ---
const TimeSlotCard = ({ time, appointment }) => {
  if (!appointment) {
    return (
      <div className="p-3 rounded-lg border bg-green-50 border-green-200">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900">{time}</span>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
        <div className="text-xs font-medium text-green-800">Disponible</div>
      </div>
    );
  }
  return (
    <div className="p-3 rounded-lg border bg-red-50 border-red-200 cursor-not-allowed">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-900">{time}</span>
        <XCircle className="h-4 w-4 text-red-600" />
      </div>
      <div className="text-xs font-medium text-red-800">Ocupado</div>
      <p className="text-xs text-gray-500 mt-1 truncate">
        {appointment.offering?.name}
      </p>
    </div>
  );
};

const AvailabilityPage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeGrid, setTimeGrid] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Cargar la lista de empleados del negocio
  useEffect(() => {
    if (user?.businessId) {
      setIsLoading(true);
      getEmployees(user.businessId)
        .then((data) => {
          setEmployees(data);
          if (data.length > 0) {
            setSelectedEmployee(data[0]);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  // Cargar el horario del empleado seleccionado para la fecha seleccionada
  useEffect(() => {
    if (!selectedEmployee || !selectedDate) {
      setTimeGrid({});
      return;
    }

    setIsLoading(true);
    const dateString = selectedDate.toISOString().split("T")[0];

    getDailyScheduleForEmployees([selectedEmployee.id], dateString)
      .then(({ appointments, workSchedules }) => {
        const grid = {};
        const interval = 30;

        if (!workSchedules || workSchedules.length === 0) {
          setTimeGrid({});
          return;
        }

        // Generamos todos los slots de tiempo posibles dentro de los turnos de trabajo
        workSchedules.forEach((shift) => {
          let currentTime = parseTime(shift.startTime);
          const endTime = parseTime(shift.endTime);

          while (currentTime < endTime) {
            const timeString = formatTime(currentTime);

            // --- LÓGICA DE SOLAPAMIENTO ---
            // Verificamos si este slot se solapa con alguna cita existente
            const occupyingAppointment = appointments.find((apt) => {
              const aptStart = new Date(apt.startTime);
              const aptEnd = new Date(apt.endTime);
              const slotStart = new Date(selectedDate);
              const [hours, minutes] = timeString.split(":");
              slotStart.setHours(hours, minutes, 0, 0);

              // Un slot está ocupado si empieza antes de que termine una cita,
              // y termina después de que esa misma cita empiece.
              // Asumimos que los slots también duran 'interval' minutos para la comprobación.
              const slotEnd = new Date(slotStart.getTime() + interval * 60000);

              return slotStart < aptEnd && slotEnd > aptStart;
            });

            grid[timeString] = occupyingAppointment || null;
            currentTime.setMinutes(currentTime.getMinutes() + interval);
          }
        });

        setTimeGrid(grid);
      })
      .catch((error) => {
        console.error("Error al cargar el horario:", error);
      })
      .finally(() => setIsLoading(false));
  }, [selectedEmployee, selectedDate]);

  // --- Funciones de ayuda para el manejo del tiempo ---
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  const formatTime = (date) =>
    date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const sortedTimeSlots = useMemo(
    () => Object.entries(timeGrid).sort((a, b) => a[0].localeCompare(b[0])),
    [timeGrid],
  );

  return (
    <Layout>
      <div className="p-6">
        <PageHeader
          title="Disponibilidad del Día"
          description="Selecciona un empleado y una fecha para ver su agenda."
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Seleccionar Empleado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[40vh] overflow-y-auto">
                {employees.map((employee) => (
                  <EmployeeListItem
                    key={employee.id}
                    employee={employee}
                    isSelected={selectedEmployee?.id === employee.id}
                    onSelect={setSelectedEmployee}
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Seleccionar Fecha
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="p-4 w-full "
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  Agenda de{" "}
                  {selectedEmployee
                    ? `${selectedEmployee.name} ${selectedEmployee.lastName}`
                    : "..."}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center p-8">
                    <LoadingSpinner />
                  </div>
                ) : Object.keys(timeGrid).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {sortedTimeSlots.map(([time, appointment]) => (
                      <TimeSlotCard
                        key={time}
                        time={time}
                        appointment={appointment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <p>
                      Este empleado no tiene un horario de trabajo definido para
                      el día seleccionado.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AvailabilityPage;
