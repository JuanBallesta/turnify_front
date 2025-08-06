import apiClient from "./api";

export const getDashboardData = async (view) => {
  try {
    const params = new URLSearchParams();
    if (view) {
      params.append("view", view);
    }
    const response = await apiClient.get(
      `/dashboard/stats?${params.toString()}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
