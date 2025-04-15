import { act, fireEvent, render, screen } from "@testing-library/react";
import { AppError } from "../../../types";
import * as React from "react";
import RegisterPage from "../../../pages/auth/register";

const mockNavigate = vi.fn();
const mockRegister = vi.fn();

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
    use: () => ({ register: mockRegister }),
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

describe("RegisterPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders register form correctly", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Registrace")).toBeInTheDocument();
    expect(
      screen.getByText("Zadejte své registrační údaje"),
    ).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^heslo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/potvrďte heslo/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrovat se" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Přihlásit se")).toBeInTheDocument();
  });

  it("submits form with correct values", async () => {
    mockRegister.mockResolvedValue(null);

    render(<RegisterPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/^heslo/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/potvrďte heslo/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
      "password123",
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays general error message when registration fails", async () => {
    const error: AppError = {
      message: "Registration failed",
      fieldErrors: {},
    };
    mockRegister.mockResolvedValue(error);

    render(<RegisterPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays field-specific errors", async () => {
    const error: AppError = {
      message: "Validation error",
      fieldErrors: {
        email: "Invalid email format",
        password: "Password is too short",
        confirmPassword: "Passwords do not match",
      },
    };
    mockRegister.mockResolvedValue(error);

    render(<RegisterPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "short");
      formData.append("confirmPassword", "nomatch");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalled();
  });

  it("clears error state when form is submitted", async () => {
    const setErrorsMock = vi.fn();
    vi.spyOn(React, "useState").mockImplementationOnce(() => [
      { message: "Registration failed", fieldErrors: {} } as AppError,
      setErrorsMock,
    ]);

    render(<RegisterPage />);

    const submitButton = screen.getByRole("button", { name: "Registrovat se" });
    const form = submitButton.closest("form")!;
    fireEvent.submit(form);

    expect(setErrorsMock).toHaveBeenCalledWith(null);
  });

  it("navigates to login page when clicking login link", () => {
    render(<RegisterPage />);

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

    render(<RegisterPage />);

    const submitButton = screen.getByRole("button", { name: "Registrovat se" });
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });
});
