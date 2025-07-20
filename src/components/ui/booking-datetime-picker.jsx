import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAvailability } from "@/services/AvailabilityService";
import { getOfferingWithEmployees } from "@/services/AssignmentService";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export const BookingDateTimePicker = ({ service, onSelectionComplete }) => {
  const [step, setStep] = useState("professional"); // professional, date, time
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // null = 'any'
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Paso 1: Cargar empleados al seleccionar el servicio
  useEffect(() => {
    if (service) {
      getOfferingWithEmployees(service.id)
        .then((details) => setEmployees(details.employees || []))
        .catch(() => setEmployees([]));
    }
  }, [service]);

  // Paso 3: Cargar disponibilidad cuando se tienen fecha y empleado (o 'any')
  useEffect(() => {
    if (step === "time" && service && selectedDate) {
      setIsLoading(true);
      const dateString = selectedDate.toISOString().split("T")[0];
      const employeeId = selectedEmployee ? selectedEmployee.id : "any";

      getAvailability(service.id, dateString, employeeId)
        .then(setAvailability)
        .finally(() => setIsLoading(false));
    }
  }, [step, service, selectedDate, selectedEmployee]);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setStep("date");
  };

  const handleSelectDate = (date) => {
    if (date) {
      setSelectedDate(date);
      setStep("time");
    }
  };

  const handleSelectTime = (slot) => {
    onSelectionComplete({
      date: selectedDate,
      time: slot.time,
      employeeId: slot.employeeId,
      employeeName: slot.employeeName,
    });
  };

  // --- Renderizado por pasos ---
  if (step === "professional") {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Paso 1: Elige un Profesional</h4>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4"
            onClick={() => handleSelectEmployee(null)}
          >
            Cualquier Profesional
          </Button>
          {employees.map((emp) => (
            <Button
              key={emp.id}
              variant="outline"
              className="h-auto p-4 flex items-center space-x-3"
              onClick={() => handleSelectEmployee(emp)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={emp.photo} />
                <AvatarFallback>{emp.name?.[0]}</AvatarFallback>
              </Avatar>
              <span>
                {emp.name} {emp.lastName}
              </span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "date") {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Paso 2: Elige una Fecha</h4>
        <Button variant="ghost" onClick={() => setStep("professional")}>
          <FiArrowLeft className="mr-2" /> Volver a Profesionales
        </Button>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelectDate}
          disabled={(date) =>
            date < new Date(new Date().setDate(new Date().getDate() - 1))
          }
        />
      </div>
    );
  }

  if (step === "time") {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Paso 3: Elige un Horario</h4>
        <Button variant="ghost" onClick={() => setStep("date")}>
          <FiArrowLeft className="mr-2" /> Volver a Fechas
        </Button>
        <p className="text-sm text-gray-500">
          Para el{" "}
          {selectedDate.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        {isLoading ? (
          <div className="text-center p-8">
            <LoadingSpinner />
          </div>
        ) : availability.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {availability.map((slot) => (
              <Button
                key={slot.time}
                variant="outline"
                size="sm"
                onClick={() => handleSelectTime(slot)}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 py-8">
            No hay horarios disponibles.
          </p>
        )}
      </div>
    );
  }

  return null;
};
