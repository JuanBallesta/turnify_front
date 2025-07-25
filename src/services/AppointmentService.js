import apiClient from "./api";

/**
 * Obtiene las citas relevantes para el usuario logueado de forma paginada.
 * @param {number} page - La página a solicitar.
 * @param {number} limit - El número de resultados por página.
 * @returns {Promise<object>} La respuesta de la API con el objeto de paginación.
 */
export const getMyAppointments = async (page = 1, limit = 6) => {
  try {
    const response = await apiClient.get(
      `/appointments?page=${page}&limit=${limit}`,
    );
    // Devolvemos el objeto completo que contiene la información de paginación
    return response.data;
  } catch (error) {
    console.error(
      "Error en AppointmentService -> getMyAppointments:",
      error.response || error,
    );
    throw error;
  }
};

/**
 * Crea una nueva cita.
 * @param {object} appointmentData - Los datos de la nueva cita.
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await apiClient.post("/appointments", appointmentData);
    return response.data;
  } catch (error) {
    console.error(
      "Error en AppointmentService -> createAppointment:",
      error.response || error,
    );
    throw error;
  }
};

/**
 * Actualiza una cita existente (ej. para cambiar su estado).
 * @param {number|string} appointmentId - El ID de la cita a actualizar.
 * @param {object} updateData - El objeto con los campos a actualizar (ej. { status: 'cancelled' }).
 */
export const updateAppointment = async (appointmentId, updateData) => {
  try {
    const response = await apiClient.put(
      `/appointments/${appointmentId}`,
      updateData,
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error en AppointmentService -> updateAppointment:",
      error.response || error,
    );
    throw error;
  }
};
