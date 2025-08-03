import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Usaremos Skeleton para el estado de carga
import { cn } from "@/lib/utils";

/**
 * Muestra una tarjeta con una estadística clave.
 * Acepta un prop 'isLoading' para mostrar un estado de esqueleto.
 */
export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
  isLoading, // <-- 1. "Atrapamos" el prop isLoading aquí
}) => {
  // 2. Usamos 'isLoading' para decidir qué renderizar
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const variantClasses = {
    primary: "bg-violet-100 text-violet-600",
    success: "bg-green-100 text-green-600",
    danger: "bg-red-100 text-red-600",
    default: "bg-gray-100 text-gray-600",
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center space-x-4">
        {Icon && (
          <div className={cn("p-3 rounded-lg", variantClasses[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
