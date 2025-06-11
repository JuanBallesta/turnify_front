import React from "react";
import { cn } from "@/lib/utils";

const LoadingSpinner = React.forwardRef(
  ({ className, size = "default", ...props }, ref) => {
    const sizes = {
      sm: "w-4 h-4",
      default: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-violet-200 border-t-violet-600",
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

LoadingSpinner.displayName = "LoadingSpinner";

const LoadingOverlay = React.forwardRef(
  (
    { className, children, isLoading = false, spinnerSize = "lg", ...props },
    ref,
  ) => {
    if (!isLoading) return children;

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {children}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-2">
            <LoadingSpinner size={spinnerSize} />
            <p className="text-sm text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  },
);

LoadingOverlay.displayName = "LoadingOverlay";

export { LoadingSpinner, LoadingOverlay };
