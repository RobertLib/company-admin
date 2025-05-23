import { fireEvent, render, screen } from "@testing-library/react";
import Switch from "../../../components/ui/switch";

describe("Switch Component", () => {
  it("renders correctly", () => {
    render(<Switch data-testid="switch-input" />);

    const switchInput = screen.getByTestId("switch-input");
    expect(switchInput).toBeInTheDocument();
    expect(switchInput).toHaveAttribute("type", "checkbox");
    expect(switchInput).toHaveAttribute("role", "switch");
  });

  it("renders with label", () => {
    render(<Switch label="Toggle me" />);

    const label = screen.getByText("Toggle me");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("id", "switch-test-id-label");
  });

  it("uses correct ARIA attributes", () => {
    render(<Switch label="Toggle me" checked data-testid="switch-input" />);

    const switchInput = screen.getByTestId("switch-input");
    expect(switchInput).toHaveAttribute("aria-checked", "true");
    expect(switchInput).toHaveAttribute(
      "aria-labelledby",
      "switch-test-id-label",
    );
  });

  it("has accessible toggle control", () => {
    render(<Switch label="Toggle me" />);

    const toggleVisual = screen.getByLabelText("Toggle me").nextElementSibling;
    expect(toggleVisual).toHaveAttribute("aria-hidden", "true");
  });

  it("applies default classes", () => {
    const { container } = render(<Switch />);

    const label = container.firstChild;
    expect(label).toHaveClass("inline-flex");
    expect(label).toHaveClass("cursor-pointer");
    expect(label).toHaveClass("items-center");
  });

  it("combines custom className with default classes", () => {
    const { container } = render(<Switch className="custom-class" />);

    const label = container.firstChild;
    expect(label).toHaveClass("custom-class");
    expect(label).toHaveClass("inline-flex");
  });

  it("forwards props to input element", () => {
    render(
      <Switch data-testid="switch-input" name="test-switch" disabled checked />,
    );

    const switchInput = screen.getByTestId("switch-input");
    expect(switchInput).toHaveAttribute("name", "test-switch");
    expect(switchInput).toBeDisabled();
    expect(switchInput).toBeChecked();
  });

  it("fires onChange event when clicked", () => {
    const handleChange = vi.fn();
    render(<Switch onChange={handleChange} label="Toggle me" />);

    fireEvent.click(screen.getByLabelText("Toggle me"));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("applies correct classes to different states", () => {
    const { container, rerender } = render(
      <Switch data-testid="switch-input" />,
    );

    const toggleVisual = container.querySelector("div[aria-hidden='true']");
    expect(toggleVisual).toHaveClass("bg-gray-200");

    rerender(<Switch data-testid="switch-input" checked />);

    const toggleContainer = container.querySelector("div[aria-hidden='true']");
    expect(toggleContainer?.className).toContain("peer-checked:bg-primary-600");
    expect(toggleContainer?.className).toContain("peer-focus:ring-primary-300");
  });
});
