import apiClient from "./api";

export const getMyAppointments = async (
  page = 1,
  status = "all",
  search = "",
  dateFilter = "all",
) => {
  try {
    const params = new URLSearchParams({
      page,
      limit: 10,
      status,
      search,
      dateFilter,
    });
    const response = await apiClient.get(`/appointments?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

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

export const getAppointmentStats = async () => {
  try {
    const response = await apiClient.get("/appointments/stats");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
