import apiClient from "./api";

export const getPublicBusinessProfile = async (slug) => {
  try {
    const response = await apiClient.get(`/public/businesses/${slug}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
