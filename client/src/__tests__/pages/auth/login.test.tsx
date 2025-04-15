import { act, fireEvent, render, screen } from "@testing-library/react";
import { AppError } from "../../../types";
import * as React from "react";
import LoginPage from "../../../pages/auth/login";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

let capturedFormState: (
  prevState: unknown,
  formData: FormData,
) => Promise<AppError | null>;

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

vi.mock("react", async () => {
  const actual = await vi.importActual("react");

  return {
    ...actual,
    use: () => ({ login: mockLogin }),
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

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText("Přihlášení")).toBeInTheDocument();
    expect(
      screen.getByText("Zadejte své přihlašovací údaje"),
    ).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/heslo/i)).toBeInTheDocument();
    expect(screen.getByText("Zapomenuté heslo?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Přihlásit se" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Registrovat se")).toBeInTheDocument();
  });

  it("submits form with correct values", async () => {
    mockLogin.mockResolvedValue(null);

    render(<LoginPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/heslo/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      await capturedFormState(null, formData);
    });

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays general error message when login fails", async () => {
    const error: AppError = {
      message: "Invalid credentials",
      fieldErrors: {},
    };
    mockLogin.mockResolvedValue(error);

    render(<LoginPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "wrongpassword");

      await capturedFormState(null, formData);
    });

    expect(mockLogin).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays field-specific errors", async () => {
    const error: AppError = {
      message: "Validation error",
      fieldErrors: {
        email: "Invalid email format",
        password: "Password is required",
      },
    };
    mockLogin.mockResolvedValue(error);

    render(<LoginPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "");

      await capturedFormState(null, formData);
    });

    expect(mockLogin).toHaveBeenCalled();
  });

  it("clears error state when form is submitted", async () => {
    const setErrorsMock = vi.fn();
    vi.spyOn(React, "useState").mockImplementationOnce(() => [
      { message: "Invalid credentials", fieldErrors: {} } as AppError,
      setErrorsMock,
    ]);

    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: "Přihlásit se" });

    const form = submitButton.closest("form")!;
    fireEvent.submit(form);

    expect(setErrorsMock).toHaveBeenCalledWith(null);
  });

  it("navigates to register page when clicking register link", () => {
    render(<LoginPage />);

    const registerLink = screen.getByTestId("link-to-/register");
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("navigates to forgot password page when clicking forgot password link", () => {
    render(<LoginPage />);

    const forgotPasswordLink = screen.getByTestId("link-to-/forgot-password");
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it("shows loading state during form submission", async () => {
    vi.spyOn(React, "useActionState").mockReturnValueOnce([
      null,
      vi.fn(),
      true,
    ]);

    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: "Přihlásit se" });
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });
});
