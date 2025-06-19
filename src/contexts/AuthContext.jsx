import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";

import { changeUserPassword } from "@/services/AuthService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // REGISTRO DE CLIENTE
  const registerClient = async (userData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "No se pudo completar el registro.");
      }

      const loginResponse = await loginClient(
        userData.userName,
        userData.password,
      );
      return loginResponse;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIN PARA CLIENTES
  const loginClient = async (userName, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.msg || "Error al iniciar sesión");
      }
      const clientWithRole = { ...data.client, role: "client" };

      setUser(clientWithRole);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(clientWithRole));

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIN PARA USUARIOS (ADMIN/EMPLEADO/SUPERUSER) ---
  const loginAdmin = async (userName, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.msg || "Credenciales de administrador inválidas");
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const changePassword = async (currentPassword, newPassword) => {
    // El 'user' ya está disponible en el scope del contexto
    if (!user || !user.role) {
      throw new Error("No hay un usuario o rol definido para esta acción.");
    }

    setIsLoading(true);
    try {
      // Pasamos el rol del usuario al servicio para que elija la ruta correcta
      const response = await changeUserPassword(
        { currentPassword, newPassword },
        user.role, // ej: 'client', 'superuser', etc.
      );

      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || "Error al cambiar la contraseña.";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token,
      loginClient,
      loginAdmin,
      registerClient,
      logout,
      updateUser,
      changePassword, // <-- Exponemos la función
    }),
    [user, token, isLoading, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
