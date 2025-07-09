import apiClient from "./api";

export const getSchedules = async (employeeId) => {
  try {
    const response = await apiClient.get(`/schedules/employee/${employeeId}`);
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

export const updateSchedules = async (employeeId, schedules) => {
  try {
    const response = await apiClient.put(
      `/schedules/employee/${employeeId}`,
      schedules,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
