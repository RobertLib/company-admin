import { act, fireEvent, render, screen } from "@testing-library/react";
import { AppError } from "../../../types";
import * as React from "react";
import logger from "../../../utils/logger";
import ResetPasswordPage from "../../../pages/auth/reset-password";

const mockNavigate = vi.fn();
const mockResetPassword = vi.fn();
const mockAlert = vi.fn();
const mockToken = "valid-reset-token";
const mockSearchParams = new URLSearchParams();
mockSearchParams.set("token", mockToken);

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
  useSearchParams: () => [mockSearchParams],
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
    use: () => ({ resetPassword: mockResetPassword }),
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

describe("ResetPasswordPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.set("token", mockToken);
  });

  it("renders reset password form correctly", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText("Obnova hesla")).toBeInTheDocument();
    expect(screen.getByText("Zadejte nové heslo")).toBeInTheDocument();

    const passwordFields = screen.getAllByLabelText(/heslo/i, { exact: false });
    expect(passwordFields.length).toBe(2);

    expect(
      screen.getByRole("button", { name: "Obnovit heslo" }),
    ).toBeInTheDocument();

    expect(screen.getByText("přihlášení")).toBeInTheDocument();
  });

  it("submits form with correct passwords and token", async () => {
    mockResetPassword.mockResolvedValue(null);

    render(<ResetPasswordPage />);

    const passwordFields = screen.getAllByLabelText(/heslo/i, { exact: false });

    fireEvent.change(passwordFields[0], {
      target: { value: "newPassword123" },
    });

    fireEvent.change(passwordFields[1], {
      target: { value: "newPassword123" },
    });

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      await capturedFormState(null, formData);
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      "newPassword123",
      "newPassword123",
      mockToken,
    );

    expect(mockAlert).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays general error message when password reset fails", async () => {
    const error: AppError = {
      message: "Reset password failed",
      fieldErrors: {},
    };
    mockResetPassword.mockResolvedValue(error);

    render(<ResetPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      await capturedFormState(null, formData);
    });

    expect(mockResetPassword).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays field-specific errors", async () => {
    const error: AppError = {
      message: "Validation error",
      fieldErrors: {
        password: "Password is too short",
        confirmPassword: "Passwords do not match",
      },
    };
    mockResetPassword.mockResolvedValue(error);

    render(<ResetPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "short");
      formData.append("confirmPassword", "different");

      await capturedFormState(null, formData);
    });

    expect(mockResetPassword).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it("clears error state when form is submitted", async () => {
    const setErrorsMock = vi.fn();
    vi.spyOn(React, "useState").mockImplementationOnce(() => [
      { message: "Reset password failed", fieldErrors: {} } as AppError,
      setErrorsMock,
    ]);

    render(<ResetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: "Obnovit heslo" });
    const form = submitButton.closest("form")!;
    fireEvent.submit(form);

    expect(setErrorsMock).toHaveBeenCalledWith(null);
  });

  it("navigates to login page when clicking login link", () => {
    render(<ResetPasswordPage />);

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

    render(<ResetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: "Obnovit heslo" });
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  it("handles errors during form submission", async () => {
    const error = new Error("Network error");
    mockResetPassword.mockRejectedValue(error);

    render(<ResetPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      await capturedFormState(null, formData);
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it("handles case when token is missing", async () => {
    mockSearchParams.delete("token");

    mockResetPassword.mockResolvedValue({
      message: "Invalid or expired token",
      fieldErrors: {},
    });

    render(<ResetPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      await capturedFormState(null, formData);
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      "newPassword123",
      "newPassword123",
      null,
    );
  });

  it("renders alert when error message exists", () => {
    vi.spyOn(React, "useState").mockImplementationOnce(() => [
      { message: "An error occurred", fieldErrors: {} } as AppError,
      vi.fn(),
    ]);

    render(<ResetPasswordPage />);

    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("does not render alert when no error message exists", () => {
    vi.spyOn(React, "useState").mockImplementationOnce(() => [null, vi.fn()]);

    render(<ResetPasswordPage />);

    const alertElements = screen.queryAllByRole("alert");
    expect(alertElements.length).toBe(0);
  });
});
