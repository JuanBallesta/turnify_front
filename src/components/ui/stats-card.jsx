import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FiCalendar } from "react-icons/fi";

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
  isLoading,
  actionLink,
  actionText = "Ver citas",
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32 mt-1" />
        </CardContent>
      </Card>
    );
  }

  const variantClasses = {
    primary: "bg-violet-100 text-violet-600",
    success: "bg-green-100 text-green-600",
    danger: "bg-red-100 text-red-600",
    default: "bg-violet-100 text-violet-600",
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("p-2 rounded-lg", variantClasses[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </CardContent>

      {actionLink && (
        <CardFooter className="pt-0 pb-3">
          <Link to={actionLink} className="w-full ">
            <Button
              size=""
              className="ml-3w-32 font-bold text-sm bg-violet-600 text-white hover:bg-violet-700 hover:text-white"
            >
              <FiCalendar className="mr-4" />
              {actionText}
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};
