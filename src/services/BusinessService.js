import apiClient from "./api";

export const getBusinesses = async () => {
  try {
    const response = await apiClient.get("/businesses");
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Error al obtener los negocios:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Crea un nuevo negocio.
 * @param {object} businessData - Los datos del negocio a crear.
 */
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

/**
 * Actualiza un negocio existente por su ID.
 * @param {string} id
 * @param {object} businessData
 */
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

/**
 * Elimina un negocio por su ID.
 * @param {string} id - El ID del negocio a eliminar.
 */
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
