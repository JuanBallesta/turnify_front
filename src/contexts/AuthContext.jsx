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

  // --- CAMBIO CLAVE: ENVOLVEMOS TODAS LAS FUNCIONES EN useCallback ---

  const registerClient = useCallback(
    async (userData) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.msg || "No se pudo completar el registro.");

        // Llamamos a loginClient, que también debe estar memoizada.
        // Como loginClient no está en el array de dependencias, no hay problema.
        return await loginClient(userData.userName, userData.password);
      } finally {
        setIsLoading(false);
      }
    },
    [API_URL],
  ); // Depende de API_URL y loginClient, pero es seguro omitir loginClient si también está en useCallback

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
          throw new Error(
            data.msg || "Credenciales de administrador inválidas",
          );

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
  }, []); // Sin dependencias

  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []); // Sin dependencias

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user)
        throw new Error(
          "No hay un usuario autenticado para realizar esta acción.",
        );
      setIsLoading(true);
      try {
        const response = await changeUserPassword(
          { currentPassword, newPassword },
          user.role,
        );
        return response;
      } catch (error) {
        const errorMessage =
          error.response?.data?.msg ||
          "Error desconocido al cambiar la contraseña.";
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  ); // Depende del 'user' actual

  // Ahora, como todas las funciones son estables, el 'useMemo' solo se recalculará
  // cuando cambien 'user', 'token', o 'isLoading'.
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
