import { render, screen } from "@testing-library/react";
import Alert from "../../../components/ui/alert";

describe("Alert Component", () => {
  it("renders correctly with default props", () => {
    render(<Alert>Test alert</Alert>);

    const alert = screen.getByText("Test alert");
    expect(alert.parentElement).toHaveClass("bg-info-100");
    expect(alert.parentElement).toHaveClass("text-info-800");
    expect(alert.parentElement).toHaveClass("border-info-500");
    expect(alert.parentElement).toHaveAttribute("role", "status");
    expect(alert.parentElement).toHaveAttribute("aria-live", "polite");
  });

  it("does not render when children are empty", () => {
    const { container } = render(<Alert></Alert>);
    expect(container.firstChild).toBeNull();
  });

  it("applies correct styles based on type", () => {
    const { rerender } = render(<Alert type="success">Success alert</Alert>);
    let alert = screen.getByRole("status");
    expect(alert).toHaveClass("bg-success-100");
    expect(alert).toHaveClass("text-success-800");
    expect(alert).toHaveClass("border-success-500");

    rerender(<Alert type="danger">Danger alert</Alert>);
    alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-danger-100");
    expect(alert).toHaveClass("text-danger-800");
    expect(alert).toHaveClass("border-danger-500");

    rerender(<Alert type="warning">Warning alert</Alert>);
    alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-warning-100");
    expect(alert).toHaveClass("text-warning-800");
    expect(alert).toHaveClass("border-warning-500");
  });

  it("applies custom className", () => {
    render(<Alert className="custom-class">Test alert</Alert>);
    const alert = screen.getByRole("status");
    expect(alert).toHaveClass("custom-class");
  });

  it("sets the correct role based on type", () => {
    const { rerender } = render(<Alert>Info alert</Alert>);
    expect(screen.getByText("Info alert").parentElement).toHaveAttribute(
      "role",
      "status",
    );

    rerender(<Alert type="success">Success alert</Alert>);
    expect(screen.getByText("Success alert").parentElement).toHaveAttribute(
      "role",
      "status",
    );

    rerender(<Alert type="danger">Danger alert</Alert>);
    expect(screen.getByText("Danger alert").parentElement).toHaveAttribute(
      "role",
      "alert",
    );

    rerender(<Alert type="warning">Warning alert</Alert>);
    expect(screen.getByText("Warning alert").parentElement).toHaveAttribute(
      "role",
      "alert",
    );
  });

  it("sets the correct aria-live attribute based on type", () => {
    const { rerender } = render(<Alert>Info alert</Alert>);
    expect(screen.getByText("Info alert").parentElement).toHaveAttribute(
      "aria-live",
      "polite",
    );

    rerender(<Alert type="danger">Danger alert</Alert>);
    expect(screen.getByText("Danger alert").parentElement).toHaveAttribute(
      "aria-live",
      "assertive",
    );

    rerender(<Alert type="warning">Warning alert</Alert>);
    expect(screen.getByText("Warning alert").parentElement).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("passes additional props to div element", () => {
    render(<Alert data-testid="test-alert">Test alert</Alert>);
    expect(screen.getByTestId("test-alert")).toBeInTheDocument();
  });
});
