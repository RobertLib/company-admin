import { AppError } from "../../../server/src/lib/errors";
import { createContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

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
      return data.error;
    }

    localStorage.setItem("token", data.accessToken);

    setCurrentUser(jwtDecode(data.accessToken));

    return null;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
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
      return data.error;
    }

    localStorage.setItem("token", data.accessToken);

    setCurrentUser(jwtDecode(data.accessToken));

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
      return data.error;
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
      return data.error;
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
