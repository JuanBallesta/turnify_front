import apiClient from "./api";

export const getUsers = async () => {
  try {
    const response = await apiClient.get("/users");
    return response.data.data || [];
  } catch (error) {
    console.error("Error al obtener la lista de usuarios:", error);
    throw error;
  }
};
