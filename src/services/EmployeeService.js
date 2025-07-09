import apiClient from "./api";

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
