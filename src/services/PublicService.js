import apiClient from "./api";

// No adjuntamos token, ya que es una llamada pública
export const getPublicBusinessProfile = async (slug) => {
  try {
    const response = await apiClient.get(`/public/businesses/${slug}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
