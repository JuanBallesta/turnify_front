import apiClient from "./api";

export const changeUserPassword = async (passwordData, userRole) => {
  try {
    const endpoint =
      userRole === "client"
        ? "/clients/change-password"
        : "/employees/change-password";

    const fullEndpoint = `/api${endpoint}`;

    const response = await apiClient.put(fullEndpoint, passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
