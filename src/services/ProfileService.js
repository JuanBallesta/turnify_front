import apiClient from "./api";

export const uploadProfilePhoto = async (userId, role, file) => {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  const endpoint =
    role === "client" ? `/users/${userId}/photo` : `/employees/${userId}/photo`;

  try {
    const response = await apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(
      "ERROR DETALLADO EN ProfileService:",
      error.response || error,
    );
    throw error;
  }
};
