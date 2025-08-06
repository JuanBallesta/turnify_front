import apiClient from "./api";

export const getAvailability = async (serviceId, date, employeeId) => {
  try {
    let url = `availability?serviceId=${serviceId}&date=${date}`;

    if (employeeId && employeeId !== "any") {
      url += `&employeeId=${employeeId}`;
    }

    const response = await apiClient.get(url);

    return response.data.data;
  } catch (error) {
    console.error(
      "Error en AvailabilityService:",
      error.response?.data || error,
    );
    throw error;
  }
};

export const getDailySchedule = async (businessId, date) => {
  try {
    const response = await apiClient.get(
      `/availability/daily?businessId=${businessId}&date=${date}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getDailyScheduleForEmployees = async (employeeIds, date) => {
  try {
    const response = await apiClient.get(
      `/availability/by-employees?employeeIds=${employeeIds.join(",")}&date=${date}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
