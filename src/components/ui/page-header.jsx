import React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";

const PageHeader = React.forwardRef(
  (
    { className, title, description, breadcrumbs, actions, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-4 pb-6 border-b border-gray-200",
          className,
        )}
        {...props}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>

          {actions && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {children}
      </div>
    );
  },
);

PageHeader.displayName = "PageHeader";

export { PageHeader };
