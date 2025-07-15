import apiClient from "./api";

export const getAvailability = async (serviceId, date, employeeId) => {
  try {
    // 1. Construimos la URL base
    let url = `availability?serviceId=${serviceId}&date=${date}`;

    // 2. Añadimos el employeeId a la URL solo si es un valor válido (no 'any' y no nulo)
    if (employeeId && employeeId !== "any") {
      url += `&employeeId=${employeeId}`;
    }

    // 3. Hacemos la petición con la URL construida
    const response = await apiClient.get(url);

    return response.data.data;
  } catch (error) {
    // Relanzamos el error para que el componente lo maneje
    console.error(
      "Error en AvailabilityService:",
      error.response?.data || error,
    );
    throw error;
  }
};
