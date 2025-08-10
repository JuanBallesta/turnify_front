import apiClient from "./api";

export const getNotifications = async () => {
  try {
    const response = await apiClient.get("/notifications");
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await apiClient.post("/notifications/read-all");
    return response.data;
  } catch (error) {
    throw error;
  }
};
