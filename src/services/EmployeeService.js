import apiClient from "./api";

/**
 * @param {object} employeeData - Los datos del empleado a crear.
 */

export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post("/api/register", employeeData);
    return response.data;
  } catch (error) {
    console.error(
      "Error al crear empleado:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * @param {string|number} [businessId] - El ID del negocio para filtrar los empleados (opcional).
 */
export const getEmployees = async (businessId) => {
  try {
    let endpoint = "/employees";
    if (businessId) {
      endpoint += `?businessId=${businessId}`;
    }
    const response = await apiClient.get(endpoint);
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Error al obtener los empleados:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Elimina un empleado por su ID.
 * @param {string|number} employeeId - El ID del empleado a eliminar.
 */
export const deleteEmployee = async (employeeId) => {
  try {
    const response = await apiClient.delete(`/employees/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error al eliminar empleado ${employeeId}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Actualiza un empleado existente.
 * @param {string|number} employeeId - El ID del empleado.
 * @param {object} employeeData - Los nuevos datos del empleado.
 */
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await apiClient.put(
      `/employees/${employeeId}`,
      employeeData,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error al actualizar empleado ${employeeId}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};
