import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAvailability } from "@/services/AvailabilityService";
import { getOfferingWithEmployees } from "@/services/AssignmentService";
import { FiArrowLeft, FiUser } from "react-icons/fi";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const BookingDateTimePicker = ({ service, onSelectionChange }) => {
  const [step, setStep] = useState("professional"); // professional -> date -> time
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // null para 'Cualquier Profesional'
  const [availability, setAvailability] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar los empleados que pueden realizar el servicio
  useEffect(() => {
    if (service) {
      setIsLoading(true);
      getOfferingWithEmployees(service.id)
        .then((details) => setEmployees(details.employees || []))
        .catch(() => setEmployees([]))
        .finally(() => setIsLoading(false));
    }
  }, [service]);

  // Cargar la disponibilidad cuando se tienen los datos necesarios
  useEffect(() => {
    if (step === "time" && service && selectedDate) {
      setIsLoading(true);
      setSelectedTimeSlot(null);
      onSelectionChange(null);
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
    setSelectedTimeSlot(slot);
    if (typeof onSelectionChange === "function") {
      onSelectionChange({
        date: selectedDate,
        time: slot.time,
        employeeId: slot.employeeId,
        employeeName: slot.employeeName,
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const n = name.trim().split(" ");
    if (n.length > 1) return `${n[0][0]}${n[n.length - 1][0]}`.toUpperCase();
    return n[0].substring(0, 2).toUpperCase();
  };

  // --- RENDERIZADO POR PASOS ---

  if (step === "professional") {
    return (
      <div className="space-y-4 p-1">
        <h4 className="font-semibold text-lg text-center">
          Paso 1: Elige un Profesional
        </h4>
        {isLoading ? (
          <div className="text-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectEmployee(null)}
              className={cn(
                "p-4 border rounded-lg text-left flex items-center space-x-3 transition-all hover:shadow-md",
                !selectedEmployee
                  ? "border-violet-500 bg-violet-50"
                  : "bg-white hover:border-gray-300",
              )}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-gray-500" />
              </div>
              <span className="font-medium">Cualquier Profesional</span>
            </button>
            {employees.map((emp) => {
              const photoUrl = emp.photo ? `${API_URL}${emp.photo}` : undefined;
              return (
                <button
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className={cn(
                    "p-4 border rounded-lg text-left flex items-center space-x-3 transition-all hover:shadow-md",
                    selectedEmployee?.id === emp.id
                      ? "border-violet-500 bg-violet-50"
                      : "bg-white hover:border-gray-300",
                  )}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={photoUrl} />
                    <AvatarFallback>
                      {getInitials(`${emp.name} ${emp.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {emp.name} {emp.lastName}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (step === "date") {
    return (
      <div className="space-y-4 p-1">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("professional")}
            className="mr-2"
          >
            <FiArrowLeft /> Volver a Profesionales
          </Button>
        </div>
        <h4 className="font-semibold text-lg text-center">
          Paso 2: Elige una Fecha
        </h4>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            disabled={(date) =>
              date < new Date(new Date().setDate(new Date().getDate() - 1))
            }
          />
        </div>
      </div>
    );
  }

  if (step === "time") {
    return (
      <div className="space-y-4 p-1">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("date")}
            className="mr-2"
          >
            <FiArrowLeft /> Volver a Fecha
          </Button>
        </div>
        <h4 className="font-semibold text-lg text-center">
          Paso 3: Elige un Horario
        </h4>
        <p className="text-sm text-gray-500 text-center">
          Para el{" "}
          {selectedDate.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
          })}
        </p>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : availability.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pt-2">
            {availability.map((slot) => (
              <Button
                key={`${slot.time}-${slot.employeeId}`}
                variant={
                  selectedTimeSlot?.time === slot.time &&
                  selectedTimeSlot?.employeeId === slot.employeeId
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => handleSelectTime(slot)}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-48">
            <p className="text-center text-sm text-gray-500">
              No hay horarios disponibles.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};
