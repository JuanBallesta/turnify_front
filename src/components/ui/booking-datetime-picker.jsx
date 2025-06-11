import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  FiCalendar,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiStar,
} from "react-icons/fi";

const BookingDateTimePicker = ({
  service,
  business,
  employees = [],
  onSelectionChange,
  getAvailableSlots,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Filtrar empleados que pueden realizar este servicio
  const availableEmployees = employees.filter(
    (emp) =>
      emp.businessId === service.businessId &&
      emp.specialties.some(
        (specialty) =>
          specialty.toLowerCase().includes(service.category.toLowerCase()) ||
          service.tags.some((tag) =>
            specialty.toLowerCase().includes(tag.toLowerCase()),
          ),
      ),
  );

  // Efecto para cargar horarios cuando se selecciona fecha y empleado
  useEffect(() => {
    if (selectedDate && selectedEmployee && getAvailableSlots) {
      setIsLoadingSlots(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const slots = getAvailableSlots(
        business.id,
        selectedEmployee.id,
        dateStr,
      );
      setAvailableSlots(slots);
      setIsLoadingSlots(false);
      setSelectedTime(null); // Reset time selection
    }
  }, [selectedDate, selectedEmployee, business.id, getAvailableSlots]);

  // Efecto para notificar cambios en la selección
  useEffect(() => {
    if (selectedDate && selectedTime && selectedEmployee) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      onSelectionChange?.({
        date: dateStr,
        time: selectedTime,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        businessId: business.id,
        serviceId: service.id,
      });
    }
  }, [
    selectedDate,
    selectedTime,
    selectedEmployee,
    onSelectionChange,
    business.id,
    service.id,
  ]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Previous month's trailing days
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date) => {
    return (
      selectedDate &&
      date &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-6">
      {/* Selección de empleado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <FiUser className="w-5 h-5" />
            <span>Seleccionar Especialista</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableEmployees.map((employee) => (
              <div
                key={employee.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedEmployee?.id === employee.id
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-violet-300"
                }`}
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={employee.image} />
                    <AvatarFallback>
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {employee.name}
                    </h4>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <FiStar className="w-3 h-3 text-yellow-500" />
                      <span>{employee.rating}</span>
                      <span>•</span>
                      <span>{employee.experience}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {employee.specialties.slice(0, 2).map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selección de fecha */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <FiCalendar className="w-5 h-5" />
                <span>Seleccionar Fecha</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-semibold min-w-[150px] text-center">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(1)}
                >
                  <FiChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                  <Button
                    key={index}
                    variant={isSelected(date) ? "default" : "ghost"}
                    size="sm"
                    className={`h-10 w-full p-0 font-normal ${
                      !date ? "invisible" : ""
                    } ${
                      isPastDate(date) ? "opacity-30 cursor-not-allowed" : ""
                    } ${
                      isToday(date) && !isSelected(date)
                        ? "bg-violet-100 text-violet-900"
                        : ""
                    }`}
                    onClick={() =>
                      date && !isPastDate(date) && setSelectedDate(date)
                    }
                    disabled={!date || isPastDate(date)}
                  >
                    {date?.getDate()}
                  </Button>
                ))}
              </div>

              {selectedDate && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Fecha seleccionada:{" "}
                  <strong>{formatDate(selectedDate)}</strong>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selección de horario */}
      {selectedDate && selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <FiClock className="w-5 h-5" />
              <span>Seleccionar Horario</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoadingSlots ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">
                  Cargando horarios disponibles...
                </p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    size="sm"
                    className="text-sm"
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No hay horarios disponibles para esta fecha.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Por favor, selecciona otra fecha.
                </p>
              </div>
            )}

            {selectedTime && (
              <div className="text-center text-sm text-gray-600 mt-4">
                Horario seleccionado: <strong>{selectedTime}</strong>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { BookingDateTimePicker };
