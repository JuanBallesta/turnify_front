import apiClient from "./api";

export const getUserTypes = async () => {
  try {
    const response = await apiClient.get("/usertypes");
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Error al obtener los tipos de usuario:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
