import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";

const InfoCard = React.forwardRef(
  (
    {
      className,
      title,
      subtitle,
      description,
      image,
      badge,
      actions,
      footer,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const variants = {
      default: "hover:shadow-md transition-shadow",
      featured: "ring-2 ring-violet-200 bg-violet-50",
      compact: "p-4",
    };

    return (
      <Card ref={ref} className={cn(variants[variant], className)} {...props}>
        {image && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader className={cn(variant === "compact" ? "p-4 pb-2" : "")}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle
                className={cn(
                  "text-lg font-semibold",
                  variant === "compact" ? "text-base" : "",
                )}
              >
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {badge && (
              <Badge variant="secondary" className="ml-2">
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>

        {description && (
          <CardContent
            className={cn(variant === "compact" ? "p-4 pt-0" : "pt-0")}
          >
            <p className="text-sm text-gray-700">{description}</p>
          </CardContent>
        )}

        {actions && (
          <CardContent
            className={cn(
              "flex gap-2",
              variant === "compact" ? "p-4 pt-2" : "pt-2",
            )}
          >
            {actions}
          </CardContent>
        )}

        {footer && (
          <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </Card>
    );
  },
);

InfoCard.displayName = "InfoCard";

export { InfoCard };
