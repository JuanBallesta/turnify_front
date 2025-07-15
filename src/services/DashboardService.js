import apiClient from "./api";

export const getDashboardData = async () => {
  try {
    const response = await apiClient.get("/dashboard/stats");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
