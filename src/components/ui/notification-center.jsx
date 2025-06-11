import React, { useState } from "react";
import {
  useNotifications,
  NOTIFICATION_TYPES,
} from "@/contexts/NotificationContext";
import { Button } from "./button";
import { Badge } from "./badge";
import { Avatar, AvatarFallback } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { EmptyState } from "./empty-state";
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiX,
  FiCalendar,
  FiMessageCircle,
  FiGift,
  FiSettings,
  FiCreditCard,
  FiStar,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getRecentNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("all");

  // Iconos por tipo de notificación
  const getNotificationIcon = (type) => {
    const iconMap = {
      // Notificaciones para clientes
      [NOTIFICATION_TYPES.APPOINTMENT_REMINDER]: FiCalendar,
      [NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED]: FiCheckCircle,
      [NOTIFICATION_TYPES.APPOINTMENT_CANCELLED]: FiX,
      [NOTIFICATION_TYPES.APPOINTMENT_COMPLETED]: FiCheck,
      [NOTIFICATION_TYPES.PROMOTION]: FiGift,
      [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: FiCreditCard,
      [NOTIFICATION_TYPES.REVIEW_REQUEST]: FiStar,

      // Notificaciones para empleados
      [NOTIFICATION_TYPES.NEW_APPOINTMENT_ASSIGNED]: FiCalendar,
      [NOTIFICATION_TYPES.APPOINTMENT_CANCELLED_BY_CLIENT]: FiAlertCircle,
      [NOTIFICATION_TYPES.SCHEDULE_UPDATED]: FiCalendar,
      [NOTIFICATION_TYPES.CLIENT_MESSAGE]: FiMessageCircle,
      [NOTIFICATION_TYPES.SHIFT_REMINDER]: FiCalendar,

      // Notificaciones para administradores
      [NOTIFICATION_TYPES.NEW_BOOKING]: FiCalendar,
      [NOTIFICATION_TYPES.EMPLOYEE_ABSENT]: FiAlertCircle,
      [NOTIFICATION_TYPES.DAILY_REPORT]: FiInfo,
      [NOTIFICATION_TYPES.NEW_EMPLOYEE_REGISTERED]: FiInfo,
      [NOTIFICATION_TYPES.BUSINESS_METRICS]: FiInfo,

      // Notificaciones del sistema
      [NOTIFICATION_TYPES.SYSTEM_UPDATE]: FiSettings,
      [NOTIFICATION_TYPES.NEW_MESSAGE]: FiMessageCircle,
      [NOTIFICATION_TYPES.SYSTEM_ERROR]: FiAlertCircle,
      [NOTIFICATION_TYPES.BACKUP_COMPLETED]: FiCheckCircle,
    };
    return iconMap[type] || FiInfo;
  };

  // Colores por tipo de notificación
  const getNotificationColor = (type, priority) => {
    if (priority === "high") return "text-red-600 bg-red-100";
    if (priority === "medium") return "text-blue-600 bg-blue-100";

    const colorMap = {
      [NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED]: "text-green-600 bg-green-100",
      [NOTIFICATION_TYPES.APPOINTMENT_CANCELLED]: "text-red-600 bg-red-100",
      [NOTIFICATION_TYPES.PROMOTION]: "text-purple-600 bg-purple-100",
      [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: "text-green-600 bg-green-100",
    };
    return colorMap[type] || "text-gray-600 bg-gray-100";
  };

  // Formatear tiempo relativo
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return "Ahora";
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return time.toLocaleDateString("es-ES");
  };

  // Filtrar notificaciones por tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((notif) => !notif.isRead);
      case "recent":
        return getRecentNotifications();
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navegar a la URL de acción si existe
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <FiBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notificaciones</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como leídas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications}
              className="text-xs text-red-600 hover:text-red-700"
            >
              <FiTrash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 m-0 h-10 bg-gray-50">
            <TabsTrigger value="all" className="text-xs">
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              No leídas ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              Recientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClasses = getNotificationColor(
                      notification.type,
                      notification.priority,
                    );

                    return (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 transition-colors ${
                          notification.isRead
                            ? "border-transparent opacity-75"
                            : "border-violet-500 bg-violet-50/30"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${colorClasses}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4
                                className={`text-sm font-medium ${
                                  notification.isRead
                                    ? "text-gray-700"
                                    : "text-gray-900"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2 ml-2">
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {getRelativeTime(notification.timestamp)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                >
                                  <FiX className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <p
                              className={`text-sm mt-1 ${
                                notification.isRead
                                  ? "text-gray-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.message}
                            </p>

                            {/* Indicadores de prioridad */}
                            {notification.priority === "high" && (
                              <div className="flex items-center space-x-1 mt-2">
                                <FiAlertCircle className="w-3 h-3 text-red-500" />
                                <span className="text-xs text-red-600 font-medium">
                                  Alta prioridad
                                </span>
                              </div>
                            )}

                            {/* Badge de tipo */}
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.type.replace("_", " ")}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={FiBell}
                    title="No hay notificaciones"
                    description={
                      activeTab === "unread"
                        ? "¡Excelente! No tienes notificaciones sin leer."
                        : activeTab === "recent"
                          ? "No tienes notificaciones recientes."
                          : "Cuando tengas notificaciones aparecerán aquí."
                    }
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-center text-violet-600 hover:text-violet-700"
              onClick={() => (window.location.href = "/notifications")}
            >
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { NotificationCenter };
