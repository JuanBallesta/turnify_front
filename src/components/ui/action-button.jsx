import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";
import { QuickTooltip } from "./tooltip";

const ActionButton = React.forwardRef(
  (
    {
      className,
      children,
      icon: Icon,
      isLoading = false,
      loadingText = "Cargando...",
      tooltip,
      variant = "default",
      size = "default",
      ...props
    },
    ref,
  ) => {
    const button = (
      <Button
        ref={ref}
        className={cn("flex items-center space-x-2", className)}
        variant={variant}
        size={size}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {Icon && <Icon className="w-4 h-4" />}
            {children && <span>{children}</span>}
          </>
        )}
      </Button>
    );

    if (tooltip) {
      return <QuickTooltip content={tooltip}>{button}</QuickTooltip>;
    }

    return button;
  },
);

ActionButton.displayName = "ActionButton";

export { ActionButton };
