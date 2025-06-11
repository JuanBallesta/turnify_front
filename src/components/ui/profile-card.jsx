import React from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import {
  FiEdit3,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiStar,
  FiSettings,
} from "react-icons/fi";

const ProfileCard = ({ user, onEditProfile, onChangePassword }) => {
  // Obtener rol en español
  const getRoleLabel = (role) => {
    const roles = {
      client: "Cliente",
      employee: "Empleado",
      administrator: "Administrador",
      superuser: "Super Usuario",
    };
    return roles[role] || role;
  };

  // Obtener color del badge según el rol
  const getRoleBadgeVariant = (role) => {
    const variants = {
      client: "secondary",
      employee: "default",
      administrator: "primary",
      superuser: "default",
    };
    return variants[role] || "secondary";
  };

  const formatMemberSince = (dateStr) => {
    if (!dateStr) return "Fecha no disponible";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <Card className="overflow-hidden">
      {/* Header con gradiente */}
      <div className="h-24 bg-gradient-to-r from-violet-600 to-violet-800"></div>

      <CardContent className="relative pb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center -mt-12 mb-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-2xl bg-violet-100 text-violet-700">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => onEditProfile?.()}
          >
            <FiEdit3 className="w-4 h-4 mr-2" />
            Editar Foto
          </Button>
        </div>

        {/* Información del usuario */}
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Badge variant={getRoleBadgeVariant(user?.role)}>
                {getRoleLabel(user?.role)}
              </Badge>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <FiStar className="w-4 h-4 text-yellow-500" />
                <span>4.8</span>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-3 text-left">
            {user?.email && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FiMail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
            )}

            {user?.phone && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FiPhone className="w-4 h-4 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            )}

            {user?.address && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{user.address}</span>
              </div>
            )}

            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              <span>Miembro desde {formatMemberSince(user?.createdAt)}</span>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="pt-4 border-t space-y-2">
            <Button className="w-full" onClick={() => onEditProfile?.()}>
              <FiEdit3 className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onChangePassword?.()}
            >
              <FiSettings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ProfileCard };
