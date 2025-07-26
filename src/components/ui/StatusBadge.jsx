import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const StatusBadge = ({ status }) => {
  const statusMap = {
    // Estados de Citas
    scheduled: {
      label: "Programada",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    completed: {
      label: "Completada",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    cancelled: {
      label: "Cancelada",
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
    "no-show": {
      label: "No Asistió",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },

    // Estados de Servicios/Empleados (booleanos)
    true: {
      label: "Activo",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    false: {
      label: "Inactivo",
      className: "bg-red-200 text-red-800 hover:bg-red-300",
    },
  };

  // Convertimos el status booleano a string para buscarlo en el mapa
  const statusKey = typeof status === "boolean" ? String(status) : status;

  const currentStatus = statusMap[statusKey] || {
    label: status,
    className: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <Badge
      className={cn(
        "font-medium border-transparent transition-colors",
        currentStatus.className,
      )}
    >
      {currentStatus.label}
    </Badge>
  );
};
