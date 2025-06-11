// src/contexts/AuthContext.jsx

import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";

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
    }),
    [
      user,
      token,
      isLoading,
      updateUser,
      loginClient,
      loginAdmin,
      registerClient,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
