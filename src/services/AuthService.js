// src/services/AuthService.js

import apiClient from "./api";

/**
 * Envía la petición para cambiar la contraseña.
 * Elige el endpoint correcto basado en el rol del usuario.
 * @param {object} passwordData - { currentPassword, newPassword }
 * @param {string} userRole - El rol del usuario (ej. 'client', 'superuser')
 */
export const changeUserPassword = async (passwordData, userRole) => {
  try {
    // Lógica para elegir el endpoint correcto
    const endpoint =
      userRole === "client"
        ? "/clients/change-password" // Ruta para clientes
        : "/employees/change-password"; // Ruta para empleados/admins

    // IMPORTANTE: Asumiendo que tu server.js usa app.use('/api', authRoutes),
    // el prefijo /api se añadirá automáticamente por el apiClient si lo configuraste así.
    // Si no, la ruta completa debe ser `/api/clients/change-password`.
    // Vamos a usar la ruta completa para estar seguros.
    const fullEndpoint = `/api${endpoint}`;

    const response = await apiClient.put(fullEndpoint, passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
