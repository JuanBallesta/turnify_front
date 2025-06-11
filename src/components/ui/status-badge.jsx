import React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
  {
    variants: {
      status: {
        pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        confirmed: "bg-blue-100 text-blue-800 border border-blue-200",
        completed: "bg-green-100 text-green-800 border border-green-200",
        cancelled: "bg-red-100 text-red-800 border border-red-200",
        active: "bg-violet-100 text-violet-800 border border-violet-200",
        inactive: "bg-gray-100 text-gray-800 border border-gray-200",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "default",
    },
  },
);

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  active: "Activo",
  inactive: "Inactivo",
};

const StatusBadge = React.forwardRef(
  ({ className, status, size, children, showDot = true, ...props }, ref) => {
    const label = children || statusLabels[status] || status;

    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ status, size }), className)}
        {...props}
      >
        {showDot && (
          <span
            className={cn("w-1.5 h-1.5 rounded-full mr-1.5", {
              "bg-yellow-500": status === "pending",
              "bg-blue-500": status === "confirmed",
              "bg-green-500": status === "completed",
              "bg-red-500": status === "cancelled",
              "bg-violet-500": status === "active",
              "bg-gray-500": status === "inactive",
            })}
          />
        )}
        {label}
      </span>
    );
  },
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };
