import apiClient from "./api";

/**
 * Obtiene las últimas notificaciones para el usuario autenticado.
 */
export const getNotifications = async () => {
  try {
    const response = await apiClient.get("/notifications");
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Marca todas las notificaciones no leídas del usuario como leídas.
 */
export const markAllAsRead = async () => {
  try {
    const response = await apiClient.post("/notifications/read-all");
    return response.data;
  } catch (error) {
    throw error;
  }
};
