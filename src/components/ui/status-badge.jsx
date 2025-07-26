import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Un componente Badge estandarizado para mostrar diferentes estados en la aplicación.
 * @param {{ status: string }} props - El estado a mostrar (ej: 'scheduled', 'completed', 'active', 'inactive').
 */
export const StatusBadge = ({ status }) => {
  const statusStyles = {
    // Estados de Citas
    scheduled: { label: "Programada", className: "bg-blue-100 text-blue-800" },
    completed: {
      label: "Completada",
      className: "bg-green-100 text-green-800",
    },
    cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800" },
    "no-show": {
      label: "No Asistió",
      className: "bg-yellow-100 text-yellow-800",
    },

    // Estados Genéricos (Activo/Inactivo)
    active: { label: "Activo", className: "bg-yellow-100 text-green-800" },
    inactive: { label: "Inactivo", className: "bg-gray-100 text-gray-800" },
  };

  // Determina el estilo a usar. Si el status no se reconoce, usa uno por defecto.
  const currentStatus = statusStyles[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge
      className={cn("font-medium border-transparent", currentStatus.className)}
    >
      {currentStatus.label}
    </Badge>
  );
};
