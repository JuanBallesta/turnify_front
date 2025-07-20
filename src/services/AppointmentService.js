import apiClient from "./api";
export const createAppointment = async (appointmentData) => {
  try {
    const response = await apiClient.post("/appointments", appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyAppointments = async () => {
  try {
    console.log("APPOINTMENT_SERVICE: Haciendo petición a /api/appointments");
    const response = await apiClient.get("/appointments");

    // --- LOG PARA VER LA RESPUESTA COMPLETA ---
    console.log("APPOINTMENT_SERVICE: Respuesta recibida de la API:", response);
    console.log(
      "APPOINTMENT_SERVICE: Accediendo a response.data:",
      response.data,
    );

    // Verificamos que la estructura sea la esperada
    if (response.data && response.data.ok) {
      console.log(
        "APPOINTMENT_SERVICE: La respuesta es OK. Devolviendo response.data.data",
      );
      return response.data.data || [];
    } else {
      console.error(
        "APPOINTMENT_SERVICE: La respuesta de la API no tuvo el formato esperado (sin .ok o .data)",
      );
      // Lanzamos un error para que el componente sepa que algo salió mal
      throw new Error("Respuesta de API inválida");
    }
  } catch (error) {
    // --- LOG PARA VER EL ERROR ATRAPADO ---
    // Si hay un error de red, CORS, o un 500, se registrará aquí.
    console.error(
      "APPOINTMENT_SERVICE: Error atrapado en el catch:",
      error.response || error,
    );
    throw error;
  }
};

export const updateAppointment = async (appointmentId, updateData) => {
  try {
    const response = await apiClient.put(
      `/appointments/${appointmentId}`,
      updateData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
