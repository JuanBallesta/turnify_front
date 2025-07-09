import apiClient from "./api";

export const getOfferingWithEmployees = async (offeringId) => {
  try {
    const response = await apiClient.get(`/offerings/${offeringId}/employees`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateAssignments = async (offeringId, employeeIds) => {
  try {
    const response = await apiClient.put(`/offerings/${offeringId}/employees`, {
      employeeIds,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
