import apiClient from "./api";

export const getBusinesses = async (page = 1, limit = 6) => {
  try {
    const response = await apiClient.get(
      `/businesses?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error en BusinessService -> getBusinesses:", error);
    throw error;
  }
};

export const getAllBusinessesForSelect = async () => {
  try {
    const response = await apiClient.get("/businesses/all");
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Error en BusinessService -> getAllBusinessesForSelect:",
      error,
    );
    throw error;
  }
};

export const createBusiness = async (businessData) => {
  try {
    const response = await apiClient.post("businesses", businessData);
    return response.data;
  } catch (error) {
    console.error(
      "Error al crear negocio:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const updateBusiness = async (id, businessData) => {
  try {
    const response = await apiClient.put(`businesses/${id}`, businessData);
    return response.data;
  } catch (error) {
    console.error(
      `Error al actualizar negocio ${id}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteBusiness = async (id) => {
  try {
    const response = await apiClient.delete(`businesses/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error al eliminar negocio ${id}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};
