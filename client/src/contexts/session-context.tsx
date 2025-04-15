import { AppError } from "../types";
import { clearCache } from "../hooks/use-query";
import { createContext, useState } from "react";
import { jwtDecode } from "../utils/jwt-decode";
import logger from "../utils/logger";

interface User {
  email: string;
}

interface SessionContextType {
  currentUser: User | null;
  forgotPassword: (email: string) => Promise<AppError | null>;
  login: (email: string, password: string) => Promise<AppError | null>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<AppError | null>;
  resetPassword: (
    password: string,
    confirmPassword: string,
    token: string | null,
  ) => Promise<AppError | null>;
}

const SessionContext = createContext<SessionContextType>({
  currentUser: null,
  forgotPassword: () => Promise.resolve(null),
  login: () => Promise.resolve(null),
  logout: () => {},
  register: () => Promise.resolve(null),
  resetPassword: () => Promise.resolve(null),
});

export const SessionProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const token = localStorage.getItem("token");

  const [currentUser, setCurrentUser] = useState<User | null>(
    token ? jwtDecode(token) : null,
  );

  const login = async (email: string, password: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return data.error ?? "An unknown error occurred";
    }

    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    setCurrentUser(jwtDecode(data.accessToken));

    clearCache();

    return null;
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        logger.error("Error logging out", error);
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    setCurrentUser(null);
    clearCache();
  };

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return data.error ?? "An unknown error occurred";
    }

    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    setCurrentUser(jwtDecode(data.accessToken));

    clearCache();

    return null;
  };

  const forgotPassword = async (email: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return data.error ?? "An unknown error occurred";
    }

    return null;
  };

  const resetPassword = async (
    password: string,
    confirmPassword: string,
    token: string | null,
  ) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword, token }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return data.error ?? "An unknown error occurred";
    }

    return null;
  };

  return (
    <SessionContext
      value={{
        currentUser,
        forgotPassword,
        login,
        logout,
        register,
        resetPassword,
      }}
    >
      {children}
    </SessionContext>
  );
};

export default SessionContext;
