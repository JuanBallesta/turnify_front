import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiCalendar,
  FiImage,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const ServiceCard = ({ service, business, onBookService }) => {
  const imageUrl = service.image
    ? service.image.startsWith("http")
      ? service.image
      : `${API_URL}${service.image}`
    : null;

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden group transition-shadow hover:shadow-lg">
      <div className="h-48 bg-gray-100 overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiImage className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/50 text-white">{service.category}</Badge>
        </div>
      </div>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
          {service.name}
        </h3>
        {business && (
          <p className="flex items-center space-x-2 text-sm text-gray-500">
            <FiMapPin className="w-4 h-4" />
            <span>{business.name}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <p className="text-sm text-gray-600 line-clamp-2 flex-grow">
          {service.description}
        </p>
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <FiClock className="w-4 h-4" />
              <span>{formatDuration(service.durationMinutes)}</span>
            </div>
            <div className="flex items-center space-x-2 font-semibold text-gray-900">
              <FiDollarSign className="w-4 h-4" />
              <span>${Number(service.price).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <Button
          className="w-full mt-auto"
          onClick={() => onBookService?.(service)}
        >
          <FiCalendar className="w-4 h-4 mr-2" />
          Reservar Cita
        </Button>
      </CardContent>
    </Card>
  );
};
