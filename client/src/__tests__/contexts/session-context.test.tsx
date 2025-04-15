import { AppError } from "../../types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MockInstance } from "vitest";
import { mockLocalStorage } from "../setup";
import { SessionProvider } from "../../contexts/session-context";
import { use, useState } from "react";
import SessionContext from "../../contexts/session-context";

const jwtDecodeMock = vi.hoisted(() =>
  vi.fn(() => ({ email: "test@example.com" })),
);
vi.mock("../../utils/jwt-decode", () => ({
  jwtDecode: jwtDecodeMock,
}));

const clearCacheMock = vi.hoisted(() => vi.fn());
vi.mock("../../hooks/use-query", () => ({
  clearCache: clearCacheMock,
}));

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
}));
vi.mock("../../utils/logger", () => ({
  default: loggerMock,
}));

global.fetch = vi.fn();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

vi.stubEnv("VITE_API_URL", "http://localhost:3000");

function TestComponent() {
  const {
    currentUser,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
  } = use(SessionContext);

  return (
    <div>
      <div data-testid="user-email">{currentUser?.email || "no user"}</div>
      <button
        data-testid="login"
        onClick={() => login("test@example.com", "password")}
      >
        Login
      </button>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
      <button
        data-testid="register"
        onClick={() => register("test@example.com", "password", "password")}
      >
        Register
      </button>
      <button
        data-testid="forgot-password"
        onClick={() => forgotPassword("test@example.com")}
      >
        Forgot Password
      </button>
      <button
        data-testid="reset-password"
        onClick={() => resetPassword("newpassword", "newpassword", "token123")}
      >
        Reset Password
      </button>
    </div>
  );
}

describe("SessionContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    global.fetch = vi.fn();
  });

  it("initializes with null user when no token exists", () => {
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>,
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent("no user");
  });

  it("initializes with user data when token exists", () => {
    mockLocalStorage.getItem.mockReturnValueOnce("fake-token");

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>,
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "test@example.com",
    );
  });

  it("logs in user successfully", async () => {
    (global.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          accessToken: "fake-token",
          refreshToken: "fake-refresh-token",
        }),
    });

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>,
    );

    fireEvent.click(screen.getByTestId("login"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password",
          }),
        }),
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "token",
        "fake-token",
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        "fake-refresh-token",
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com",
      );
      expect(clearCacheMock).toHaveBeenCalled();
    });
  });

  it("logs out user successfully", async () => {
    (global.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "token") return "fake-token";
      if (key === "refreshToken") return "fake-refresh-token";
      return null;
    });

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>,
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "test@example.com",
    );

    fireEvent.click(screen.getByTestId("logout"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/logout",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        }),
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("refreshToken");
      expect(screen.getByTestId("user-email")).toHaveTextContent("no user");
      expect(clearCacheMock).toHaveBeenCalled();
    });

    mockLocalStorage.getItem.mockReset();
  });

  it("registers user successfully", async () => {
    (global.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          accessToken: "fake-token",
          refreshToken: "fake-refresh-token",
        }),
    });

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>,
    );

    fireEvent.click(screen.getByTestId("register"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/register",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password",
            confirmPassword: "password",
          }),
        }),
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "token",
        "fake-token",
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        "fake-refresh-token",
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com",
      );
    });
  });

  it("sends forgot password request successfully", async () => {
    (global.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>,
    );

    fireEvent.click(screen.getByTestId("forgot-password"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/forgot-password",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "test@example.com" }),
        }),
      );
    });
  });

  it("resets password successfully", async () => {
    (global.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>,
    );

    fireEvent.click(screen.getByTestId("reset-password"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/reset-password",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            password: "newpassword",
            confirmPassword: "newpassword",
            token: "token123",
          }),
        }),
      );
    });
  });

  it("handles API errors during login", async () => {
    (global.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid credentials" }),
    });

    function ErrorTestComponent() {
      const { login } = use(SessionContext);
      const [error, setError] = useState<AppError | null>(null);

      return (
        <div>
          <div data-testid="error">
            {(error as unknown as string) || "no error"}
          </div>
          <button
            data-testid="login-error"
            onClick={async () => {
              const err = await login("test@example.com", "wrong");
              setError(err);
            }}
          >
            Login Error
          </button>
        </div>
      );
    }

    render(
      <SessionProvider>
        <ErrorTestComponent />
      </SessionProvider>,
    );

    fireEvent.click(screen.getByTestId("login-error"));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Invalid credentials",
      );
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
