import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAvailability } from "@/services/AvailabilityService";
import { getOfferingWithEmployees } from "@/services/AssignmentService";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Importar cn para clases condicionales

export const BookingDateTimePicker = ({
  service,
  onSelectionComplete,
  onBack,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // null para 'Cualquiera'
  const [availability, setAvailability] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (service) {
      getOfferingWithEmployees(service.id)
        .then((details) => setEmployees(details.employees || []))
        .catch(() => setEmployees([]));
    }
  }, [service]);

  useEffect(() => {
    if (service && selectedDate) {
      setIsLoading(true);
      setSelectedTimeSlot(null);
      const dateString = selectedDate.toISOString().split("T")[0];
      const employeeId = selectedEmployee ? selectedEmployee.id : "any";

      getAvailability(service.id, dateString, employeeId)
        .then(setAvailability)
        .finally(() => setIsLoading(false));
    }
  }, [service, selectedDate, selectedEmployee]);

  const handleSelectTime = (slot) => {
    setSelectedTimeSlot(slot);
    onSelectionComplete({
      date: selectedDate,
      time: slot.time,
      employeeId: slot.employeeId,
      employeeName: slot.employeeName,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* --- COLUMNA IZQUIERDA: CALENDARIO Y PROFESIONALES --- */}
      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold text-gray-800">
            1. Elige un Profesional
          </Label>
          <div className="flex flex-wrap gap-3 mt-3">
            <div
              onClick={() => setSelectedEmployee(null)}
              className={cn(
                "p-2 border rounded-lg flex-1 min-w-[150px] cursor-pointer transition-all",
                !selectedEmployee
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white hover:border-violet-400",
              )}
            >
              <p className="font-semibold text-center">Cualquier Profesional</p>
            </div>
            {employees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={cn(
                  "p-2 border rounded-lg flex items-center space-x-3 flex-1 min-w-[150px] cursor-pointer transition-all",
                  selectedEmployee?.id === emp.id
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white hover:border-violet-400",
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={emp.photo} />
                  <AvatarFallback>{emp.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{emp.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-base font-semibold text-gray-800">
            2. Elige una Fecha
          </Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) =>
              date < new Date(new Date().setDate(new Date().getDate() - 1))
            }
            className="p-0 mt-2"
            // --- ESTILOS PARA AGRANDAR EL CALENDARIO ---
            classNames={{
              months:
                "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-lg font-medium",
              nav: "space-x-1 flex items-center",
              nav_button:
                "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell:
                "text-gray-500 rounded-md w-10 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100",
              day_selected:
                "bg-violet-600 text-white hover:bg-violet-600 hover:text-white focus:bg-violet-600 focus:text-white",
              day_today: "bg-gray-100 text-gray-900",
              day_outside: "text-gray-400 opacity-50",
              day_disabled: "text-gray-400 opacity-50",
            }}
          />
        </div>
      </div>

      {/* --- COLUMNA DERECHA: HORARIOS --- */}
      <div className="md:border-l md:pl-8">
        <Label className="text-base font-semibold text-gray-800">
          3. Elige un Horario
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          Disponibilidad para el{" "}
          {selectedDate.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : availability.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 max-h-[20rem] overflow-y-auto pr-2">
            {availability.map((slot) => (
              <Button
                key={slot.time}
                variant={
                  selectedTimeSlot?.time === slot.time ? "default" : "outline"
                }
                onClick={() => handleSelectTime(slot)}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-48">
            <p className="text-center text-sm text-gray-500">
              No hay horarios disponibles para esta selección.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
