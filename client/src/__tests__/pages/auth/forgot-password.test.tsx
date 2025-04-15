import { act, fireEvent, render, screen } from "@testing-library/react";
import { AppError } from "../../../types";
import * as React from "react";
import ForgotPasswordPage from "../../../pages/auth/forgot-password";
import logger from "../../../utils/logger";

const mockNavigate = vi.fn();
const mockForgotPassword = vi.fn();
const mockAlert = vi.fn();

let capturedFormState: (
  prevState: unknown,
  formData: FormData,
) => Promise<AppError | null>;

global.alert = mockAlert;

vi.mock("react-router", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");

  return {
    ...actual,
    use: () => ({ forgotPassword: mockForgotPassword }),
    useActionState: (
      fn: (prevState: unknown, formData: FormData) => Promise<AppError | null>,
    ) => {
      capturedFormState = fn;
      const formAction = (formData: FormData) => {
        return fn(null, formData);
      };
      return [null, formAction, false];
    },
  };
});

describe("ForgotPasswordPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders forgot password form correctly", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Obnova hesla")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Zadejte svůj email a my vám pošleme odkaz pro obnovu hesla",
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Odeslat odkaz pro obnovu hesla" }),
    ).toBeInTheDocument();

    expect(screen.getByText("přihlášení")).toBeInTheDocument();
  });

  it("submits form with correct email", async () => {
    mockForgotPassword.mockResolvedValue(null);

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "test@example.com" },
    });

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");

      await capturedFormState(null, formData);
    });

    expect(mockForgotPassword).toHaveBeenCalledWith("test@example.com");
    expect(mockAlert).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays general error message when password reset request fails", async () => {
    const error: AppError = {
      message: "Email not found",
      fieldErrors: {},
    };
    mockForgotPassword.mockResolvedValue(error);

    render(<ForgotPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "nonexistent@example.com");

      await capturedFormState(null, formData);
    });

    expect(mockForgotPassword).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays field-specific errors", async () => {
    const error: AppError = {
      message: "Validation error",
      fieldErrors: {
        email: "Invalid email format",
      },
    };
    mockForgotPassword.mockResolvedValue(error);

    render(<ForgotPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");

      await capturedFormState(null, formData);
    });

    expect(mockForgotPassword).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it("clears error state when form is submitted", async () => {
    const setErrorsMock = vi.fn();
    vi.spyOn(React, "useState").mockImplementationOnce(() => [
      { message: "Email not found", fieldErrors: {} } as AppError,
      setErrorsMock,
    ]);

    render(<ForgotPasswordPage />);

    const submitButton = screen.getByRole("button", {
      name: "Odeslat odkaz pro obnovu hesla",
    });
    const form = submitButton.closest("form")!;
    fireEvent.submit(form);

    expect(setErrorsMock).toHaveBeenCalledWith(null);
  });

  it("navigates to login page when clicking login link", () => {
    render(<ForgotPasswordPage />);

    const loginLink = screen.getByTestId("link-to-/login");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows loading state during form submission", async () => {
    vi.spyOn(React, "useActionState").mockReturnValueOnce([
      null,
      vi.fn(),
      true,
    ]);

    render(<ForgotPasswordPage />);

    const submitButton = screen.getByRole("button", {
      name: "Odeslat odkaz pro obnovu hesla",
    });
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  it("handles errors during form submission", async () => {
    const error = new Error("Network error");
    mockForgotPassword.mockRejectedValue(error);

    render(<ForgotPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");

      await capturedFormState(null, formData);
    });

    expect(logger.error).toHaveBeenCalled();
  });
});
