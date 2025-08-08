import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getNotifications,
  markAllAsRead,
} from "@/services/NotificationService";
import { FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("No se pudieron cargar las notificaciones.");
    }
  };

  useEffect(() => {
    // Cargar notificaciones al montar y luego cada minuto
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    // Si hay notificaciones no leídas y se abre el popover, las marcamos como leídas después de un momento
    if (open && unreadCount > 0) {
      setTimeout(() => {
        markAllAsRead()
          .then(() => {
            // Actualizamos la UI inmediatamente sin esperar el próximo fetch
            setNotifications((current) =>
              current.map((n) => ({ ...n, isRead: true })),
            );
          })
          .catch((err) => console.error("Error al marcar como leídas:", err));
      }, 2000); // Un pequeño delay
    }
  };

  // Función para formatear el tiempo relativo
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
    return "justo ahora";
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <FiBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 font-semibold border-b text-sm">Notificaciones</div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-center text-gray-500">
              No tienes notificaciones nuevas.
            </p>
          ) : (
            notifications.map((notif) => (
              <Link
                to={notif.link || "#"}
                key={notif.id}
                onClick={() => setIsOpen(false)}
              >
                <div
                  className={cn(
                    "p-4 border-b hover:bg-gray-50",
                    !notif.isRead && "bg-violet-50",
                  )}
                >
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(notif.createdAt)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
