import React from "react";
import { Card, CardContent, CardHeader } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  FiClock,
  FiDollarSign,
  FiStar,
  FiMapPin,
  FiUser,
  FiCalendar,
} from "react-icons/fi";

const ServiceCard = ({
  service,
  business,
  employees = [],
  onBookService,
  isLoading = false,
}) => {
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getServiceEmployees = () => {
    return employees.filter(
      (emp) =>
        emp.businessId === service.businessId &&
        emp.specialties.some(
          (specialty) =>
            specialty.toLowerCase().includes(service.category.toLowerCase()) ||
            service.tags.some((tag) =>
              specialty.toLowerCase().includes(tag.toLowerCase()),
            ),
        ),
    );
  };

  const serviceEmployees = getServiceEmployees();

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 group">
      {/* Imagen del servicio */}
      {service.image && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              <FiStar className="w-3 h-3 mr-1" />
              {service.rating}
            </Badge>
          </div>
          <div className="absolute top-3 left-3">
            <Badge className="bg-violet-600 text-white">
              {service.category}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {service.description}
          </p>

          {/* Información del negocio */}
          {business && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FiMapPin className="w-4 h-4" />
              <span className="truncate">{business.name}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Detalles del servicio */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {formatDuration(service.duration)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FiDollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">
              ${service.price}
            </span>
          </div>
        </div>

        {/* Tags del servicio */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
                {tag}
              </Badge>
            ))}
            {service.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{service.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Empleados disponibles */}
        {serviceEmployees.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiUser className="w-4 h-4" />
              <span>Especialistas disponibles:</span>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto">
              {serviceEmployees.slice(0, 3).map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-2 min-w-0"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={employee.image} />
                    <AvatarFallback className="text-xs">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 truncate">
                    {employee.name}
                  </span>
                </div>
              ))}
              {serviceEmployees.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{serviceEmployees.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Calificación y reseñas */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{service.rating}</span>
            </div>
            <span className="text-gray-500">
              ({service.totalReviews} reseñas)
            </span>
          </div>
        </div>

        {/* Botón de reserva */}
        <Button
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          onClick={() => onBookService?.(service)}
          disabled={isLoading}
        >
          <FiCalendar className="w-4 h-4 mr-2" />
          {isLoading ? "Procesando..." : "Reservar Cita"}
        </Button>

        {/* Información adicional del negocio */}
        {business && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{business.address}</span>
              <div className="flex items-center space-x-1">
                <FiStar className="w-3 h-3" />
                <span>{business.rating}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ServiceCard };
