import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = React.forwardRef(
  (
    {
      className,
      items = [],
      separator = <FiChevronRight className="w-4 h-4" />,
      showHome = true,
      homeHref = "/dashboard",
      ...props
    },
    ref,
  ) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(
          "flex items-center space-x-1 text-sm text-gray-600",
          className,
        )}
        {...props}
      >
        {showHome && (
          <>
            <Link
              to={homeHref}
              className="flex items-center space-x-1 hover:text-violet-600 transition-colors"
            >
              <FiHome className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            {items.length > 0 && (
              <span className="text-gray-400">{separator}</span>
            )}
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={item.href || index}>
              {isLast ? (
                <span className="font-medium text-gray-900">{item.label}</span>
              ) : (
                <>
                  <Link
                    to={item.href}
                    className="hover:text-violet-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                  <span className="text-gray-400">{separator}</span>
                </>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  },
);

Breadcrumbs.displayName = "Breadcrumbs";

export { Breadcrumbs };
