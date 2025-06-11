import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const EmptyState = React.forwardRef(
  (
    {
      className,
      icon: Icon,
      title,
      description,
      action,
      actionLabel,
      onAction,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center",
          className,
        )}
        {...props}
      >
        {Icon && (
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-violet-100">
            <Icon className="w-8 h-8 text-violet-600" />
          </div>
        )}

        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        )}

        {description && (
          <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
        )}

        {action && onAction && (
          <Button
            onClick={onAction}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {actionLabel || action}
          </Button>
        )}
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";

export { EmptyState };
