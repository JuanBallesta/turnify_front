import apiClient from "./api";

export const getOfferings = async () => {
  try {
    const response = await apiClient.get("/offerings");
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

export const createOffering = async (offeringData) => {
  try {
    const response = await apiClient.post("/offerings", offeringData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOffering = async (id, offeringData) => {
  try {
    const response = await apiClient.put(`/offerings/${id}`, offeringData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOffering = async (id) => {
  try {
    const response = await apiClient.delete(`/offerings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadOfferingPhoto = async (offeringId, file) => {
  const formData = new FormData();
  // El nombre 'servicePhoto' debe coincidir con el del middleware
  formData.append("servicePhoto", file);

  try {
    const response = await apiClient.post(
      `/offerings/${offeringId}/photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
