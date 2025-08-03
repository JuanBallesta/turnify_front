import apiClient from "./api";

export const searchUsers = async (query) => {
  try {
    const response = await apiClient.get(`/users/search?query=${query}`);

    return response.data.data || [];
  } catch (error) {
    console.error(
      "ERROR en searchUsers Service:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createGuestUser = async (userData) => {
  try {
    const response = await apiClient.post("/users/guest", userData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  try {
    const response = await apiClient.get(`/users/by-email?email=${email}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
