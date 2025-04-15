import { AppError } from "../types";
import { jwtDecode } from "./jwt-decode";
import logger from "./logger";

interface JwtPayload {
  exp: number;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);

    return decoded.exp <= currentTime + 30;
  } catch {
    return true;
  }
};

let refreshPromise: Promise<boolean> | null = null;

const refreshTokenIfNeeded = async (): Promise<boolean> => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  if (!isTokenExpired(token)) return true;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem("token", data.accessToken);

      return true;
    } catch (error) {
      logger.error("Error refreshing token:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

interface ApiFetchOptions extends RequestInit {
  skipAuthHeader?: boolean;
  skipRefresh?: boolean;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuthHeader, skipRefresh, ...fetchOptions } = options;

  if (!skipRefresh) {
    const refreshed = await refreshTokenIfNeeded();
    if (!refreshed) {
      if (
        localStorage.getItem("token") ||
        localStorage.getItem("refreshToken")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
      throw new Error("Authentication failed");
    }
  }

  const headers = new Headers(fetchOptions.headers || {});

  if (!skipAuthHeader) {
    const token = localStorage.getItem("token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let appError: AppError;

    try {
      const result = await response.json();
      if (result.error) {
        appError = result.error;
      } else {
        appError = {
          message: `Failed to fetch: ${response.status} ${response.statusText}`,
          statusCode: response.status,
        };
      }
    } catch {
      const errorText = await response.text().catch(() => "");
      appError = {
        message: `Failed to fetch: ${response.status} ${response.statusText}. Details: ${errorText || "Unknown error"}`,
        statusCode: response.status,
      };
    }

    throw appError;
  }

  const result = await response.json().catch((error) => {
    throw {
      message: `Invalid JSON response: ${error.message}`,
      statusCode: 500,
    } as AppError;
  });

  return result;
}
