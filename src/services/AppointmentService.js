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
    const response = await apiClient.get("/appointments/my");
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};
