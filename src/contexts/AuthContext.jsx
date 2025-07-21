import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";
import apiClient from "@/services/api";
import { changeUserPassword } from "@/services/AuthService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const loginClient = useCallback(
    async (userName, password) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, password }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok)
          throw new Error(data.msg || "Error al iniciar sesión");

        const clientWithRole = { ...data.client, role: "client" };
        setUser(clientWithRole);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(clientWithRole));
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    [API_URL],
  );

  const registerClient = useCallback(
    async (userData) => {
      setIsLoading(true);
      try {
        await apiClient.post("/api/users", userData);
        return await loginClient(userData.username, userData.password);
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loginClient],
  );

  const loginAdmin = useCallback(
    async (userName, password) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, password }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok)
          throw new Error(data.msg || "Credenciales inválidas");

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    [API_URL],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // --- FUNCIÓN updateUser VERIFICADA Y ROBUSTA ---
  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      // Fusiona los datos antiguos con los nuevos
      const updatedUser = { ...prevUser, ...newUserData };
      // Guarda el objeto actualizado en localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // Devuelve el nuevo estado
      return updatedUser;
    });
  }, []);

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user) throw new Error("No hay un usuario autenticado.");
      setIsLoading(true);
      try {
        const response = await changeUserPassword(
          { currentPassword, newPassword },
          user.role,
        );
        return response;
      } catch (error) {
        const errorMessage =
          error.response?.data?.msg || "Error al cambiar la contraseña.";
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

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
      changePassword,
    }),
    [
      user,
      token,
      isLoading,
      loginClient,
      loginAdmin,
      registerClient,
      logout,
      updateUser,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
