import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getAvailability,
  getDailyScheduleForEmployees,
} from "@/services/AvailabilityService";
import { getOfferingWithEmployees } from "@/services/AssignmentService";
import { FiArrowLeft, FiUser, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- Sub-componente para la Tarjeta de Horario ---
const TimeSlotCard = ({ time, isAvailable, onClick, isSelected }) => {
  return (
    <button
      onClick={isAvailable ? onClick : undefined}
      disabled={!isAvailable}
      className={cn(
        "p-3 rounded-lg border text-left w-full transition-all text-sm",
        isAvailable
          ? "bg-green-50 border-green-200 hover:shadow-md hover:border-green-400"
          : "bg-red-50 border-red-200 cursor-not-allowed opacity-70",
        isSelected &&
          isAvailable &&
          "ring-2 ring-violet-500 border-violet-500 bg-violet-100",
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-gray-900">{time}</span>
        {isAvailable ? (
          <FiCheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <FiXCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div
        className={cn(
          "text-xs font-medium",
          isAvailable ? "text-green-800" : "text-red-800",
        )}
      >
        {isAvailable ? "Disponible" : "Ocupado"}
      </div>
    </button>
  );
};

// --- Funciones de ayuda para el manejo del tiempo ---
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};
const formatTime = (date) => date.toTimeString().slice(0, 5);

export const BookingDateTimePicker = ({
  service,
  onSelectionChange,
  onContinue,
}) => {
  const [step, setStep] = useState("professional");
  const [selectedDate, setSelectedDate] = useState(undefined); // <-- INICIALIZADO COMO UNDEFINED
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fullDaySchedule, setFullDaySchedule] = useState({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (service) {
      setIsLoading(true);
      getOfferingWithEmployees(service.id)
        .then((details) => setEmployees(details.employees || []))
        .catch(() => setEmployees([]))
        .finally(() => setIsLoading(false));
    }
  }, [service]);

  useEffect(() => {
    if (step === "time" && service && selectedDate) {
      setIsLoading(true);
      setSelectedTimeSlot(null);
      if (typeof onSelectionChange === "function") {
        onSelectionChange(null);
      }

      const dateString = selectedDate.toISOString().split("T")[0];
      const employeeIds = selectedEmployee
        ? [selectedEmployee.id]
        : employees.map((e) => e.id);

      if (employeeIds.length === 0 && selectedEmployee) {
        setIsLoading(false);
        setFullDaySchedule({});
        return;
      }

      getDailyScheduleForEmployees(employeeIds, dateString)
        .then(({ workSchedules, appointments }) => {
          const grid = {};
          const interval = 30;

          if (!workSchedules || workSchedules.length === 0) {
            setFullDaySchedule({});
            return;
          }

          workSchedules.forEach((shift) => {
            let currentTime = parseTime(shift.startTime);
            const endTime = parseTime(shift.endTime);
            while (
              new Date(
                currentTime.getTime() + service.durationMinutes * 60000,
              ) <= endTime
            ) {
              const timeString = formatTime(currentTime);
              grid[timeString] = {
                time: timeString,
                isAvailable: true,
                details: null,
              };
              currentTime.setMinutes(currentTime.getMinutes() + interval);
            }
          });

          appointments.forEach((apt) => {
            const aptStart = new Date(apt.startTime);
            const aptEnd = new Date(apt.endTime);
            Object.keys(grid).forEach((timeString) => {
              const slotStart = new Date(`${dateString}T${timeString}`);
              const slotEnd = new Date(
                slotStart.getTime() + service.durationMinutes * 60000,
              );
              if (slotStart < aptEnd && slotEnd > aptStart) {
                grid[timeString].isAvailable = false;
              }
            });
          });

          const employeeDetailsMap = new Map(employees.map((e) => [e.id, e]));

          Object.keys(grid).forEach((timeString) => {
            if (grid[timeString].isAvailable) {
              const workingEmployee = workSchedules.find((ws) => {
                const start = parseTime(ws.startTime);
                const end = parseTime(ws.endTime);
                const current = parseTime(timeString);
                return current >= start && current < end;
              });
              const employeeForSlot = employeeDetailsMap.get(
                workingEmployee?.employeeId,
              );

              if (employeeForSlot) {
                grid[timeString].details = {
                  time: timeString,
                  employeeId: employeeForSlot.id,
                  employeeName: `${employeeForSlot.name} ${employeeForSlot.lastName}`,
                };
              }
            }
          });
          setFullDaySchedule(grid);
        })
        .catch(() => setFullDaySchedule({}))
        .finally(() => setIsLoading(false));
    }
  }, [
    step,
    service,
    selectedDate,
    selectedEmployee,
    employees,
    onSelectionChange,
  ]);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setStep("date");
  };

  const handleSelectDate = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSelectTime = (slot) => {
    const selectionDetails = slot.details;
    setSelectedTimeSlot(selectionDetails);

    if (typeof onSelectionChange === "function" && selectionDetails) {
      onSelectionChange({
        date: selectedDate,
        time: selectionDetails.time,
        employeeId: selectionDetails.employeeId,
        employeeName: selectionDetails.employeeName,
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const n = name.trim().split(" ");
    if (n.length > 1) return `${n[0][0]}${n[n.length - 1][0]}`.toUpperCase();
    return n[0].substring(0, 2).toUpperCase();
  };

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
            {employees.map((emp) => {
              const photoUrl = emp.photo ? `${API_URL}${emp.photo}` : undefined;
              return (
                <button
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className="p-4 border rounded-lg text-left flex items-center space-x-3 transition-all hover:shadow-md bg-white"
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
            <FiArrowLeft /> Volver
          </Button>
        </div>
        <h4 className="font-semibold text-lg text-center">
          Paso 2: Elige una Fecha
        </h4>
        <div className="flex flex-col items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            disabled={(date) =>
              date < new Date(new Date().setDate(new Date().getDate() - 1))
            }
          />
          <Button
            className="w-full max-w-xs mt-4"
            onClick={() => setStep("time")}
            disabled={!selectedDate}
          >
            Ver Horarios
          </Button>
        </div>
      </div>
    );
  }

  if (step === "time") {
    const sortedTimeSlots = Object.values(fullDaySchedule).sort((a, b) =>
      a.time.localeCompare(b.time),
    );
    return (
      <div className="space-y-4 p-1">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("date")}
            className="mr-2"
          >
            <FiArrowLeft /> Volver
          </Button>
        </div>
        <h4 className="font-semibold text-lg text-center">
          Paso 3: Elige un Horario
        </h4>
        <p className="text-sm text-gray-500 text-center">
          Para el{" "}
          {selectedDate?.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
          })}
        </p>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : sortedTimeSlots.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pt-2">
            {sortedTimeSlots.map((slot) => (
              <TimeSlotCard
                key={slot.time}
                time={slot.time}
                isAvailable={slot.isAvailable}
                onClick={() => handleSelectTime(slot)}
                isSelected={selectedTimeSlot?.time === slot.details?.time}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-48">
            <p className="text-center text-sm text-gray-500">
              Este profesional no trabaja este día.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};
