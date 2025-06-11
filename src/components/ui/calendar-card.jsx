import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
} from "react-icons/fi";

const CalendarCard = React.forwardRef(
  (
    {
      className,
      selectedDate,
      onDateSelect,
      appointments = [],
      availableSlots = [],
      onSlotSelect,
      ...props
    },
    ref,
  ) => {
    const [currentDate, setCurrentDate] = useState(new Date());

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
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + direction);
      setCurrentDate(newDate);
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

    const isSelected = (date) => {
      return (
        selectedDate &&
        date &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    };

    const hasAppointments = (date) => {
      if (!date || !appointments.length) return false;
      return appointments.some((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate.getDate() === date.getDate() &&
          aptDate.getMonth() === date.getMonth() &&
          aptDate.getFullYear() === date.getFullYear()
        );
      });
    };

    const days = getDaysInMonth(currentDate);

    return (
      <Card ref={ref} className={cn("w-full max-w-md", className)} {...props}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <FiCalendar className="w-5 h-5" />
              <span>Seleccionar Fecha</span>
            </CardTitle>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
              <FiChevronLeft className="w-4 h-4" />
            </Button>

            <h3 className="font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>

            <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
              <FiChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <Button
                key={index}
                variant={isSelected(date) ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 font-normal relative",
                  !date && "invisible",
                  isToday(date) && "bg-violet-100 text-violet-900",
                  isSelected(date) &&
                    "bg-violet-600 text-white hover:bg-violet-700",
                  hasAppointments(date) &&
                    !isSelected(date) &&
                    "bg-red-50 text-red-900",
                )}
                onClick={() => date && onDateSelect?.(date)}
                disabled={!date}
              >
                {date?.getDate()}
                {hasAppointments(date) && (
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </Button>
            ))}
          </div>

          {selectedDate && availableSlots.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-1">
                <FiClock className="w-4 h-4" />
                <span>Horarios Disponibles</span>
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => onSlotSelect?.(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-violet-600 rounded-full" />
              <span>Seleccionado</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Con citas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

CalendarCard.displayName = "CalendarCard";

export { CalendarCard };
