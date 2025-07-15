import apiClient from "./api";

export const uploadProfilePhoto = async (userId, role, file) => {
  const formData = new FormData();
  // El nombre 'profilePhoto' debe coincidir con el del middleware de multer
  formData.append("profilePhoto", file);

  const endpoint =
    role === "client" ? `/users/${userId}/photo` : `/employees/${userId}/photo`;

  try {
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Es crucial para la subida de archivos
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
