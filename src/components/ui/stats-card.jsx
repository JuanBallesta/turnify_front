import React from "react";
import { cn } from "@/lib/utils";

const StatsCard = React.forwardRef(
  (
    {
      className,
      title,
      value,
      description,
      icon: Icon,
      trend,
      trendValue,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const variants = {
      default: "bg-white border-violet-200",
      primary: "bg-violet-50 border-violet-300",
      success: "bg-green-50 border-green-300",
      warning: "bg-yellow-50 border-yellow-300",
      danger: "bg-red-50 border-red-300",
    };

    const iconVariants = {
      default: "text-violet-600 bg-violet-100",
      primary: "text-violet-700 bg-violet-200",
      success: "text-green-700 bg-green-200",
      warning: "text-yellow-700 bg-yellow-200",
      danger: "text-red-700 bg-red-200",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border p-6 shadow-sm transition-all hover:shadow-md",
          variants[variant],
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    trend === "up"
                      ? "text-green-700 bg-green-100"
                      : "text-red-700 bg-red-100",
                  )}
                >
                  {trend === "up" ? "↗" : "↘"} {trendValue}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-lg",
                iconVariants[variant],
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

StatsCard.displayName = "StatsCard";

export { StatsCard };
