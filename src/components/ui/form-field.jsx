import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

const FormField = React.forwardRef(
  (
    {
      className,
      label,
      htmlFor,
      error,
      required = false,
      description,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label
            htmlFor={htmlFor}
            className={cn(
              "block text-sm font-medium text-gray-700",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            )}
          >
            {label}
          </Label>
        )}

        {description && <p className="text-sm text-gray-500">{description}</p>}

        <div className="relative">{children}</div>

        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

const FormSection = React.forwardRef(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-6", className)} {...props}>
        {(title || description) && (
          <div className="border-b border-gray-200 pb-4">
            {title && (
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        )}

        <div className="space-y-4">{children}</div>
      </div>
    );
  },
);

FormSection.displayName = "FormSection";

export { FormField, FormSection };
