import { fireEvent, render, screen } from "@testing-library/react";
import Checkbox from "../../../components/ui/checkbox";

describe("Checkbox Component", () => {
  it("renders correctly with default props", () => {
    render(<Checkbox name="test" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("renders with label", () => {
    render(<Checkbox name="test" label="Test Checkbox" />);
    const checkbox = screen.getByLabelText("Test Checkbox");
    expect(checkbox).toBeInTheDocument();

    const label = screen.getByText("Test Checkbox");
    expect(label.tagName.toLowerCase()).toBe("label");
    expect(label).toHaveAttribute("for", "test");
  });

  it("renders with required indicator when required is true", () => {
    render(<Checkbox name="test" label="Required Field" required />);
    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass("text-danger-500");
  });

  it("applies custom className", () => {
    render(<Checkbox name="test" className="custom-class" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("custom-class");
  });

  it("displays error message when error prop is provided", () => {
    render(<Checkbox name="test" error="This field is required" />);
    const errorMessage = screen.getByTestId("form-error");
    expect(errorMessage).toHaveTextContent("This field is required");
  });

  it("applies error styling when error prop is provided", () => {
    render(<Checkbox name="test" error="Error message" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.className).toContain("border-danger-500!");
    expect(checkbox.className).toContain("focus:ring-danger-300!");
  });

  it("toggles checked state when clicked", () => {
    render(<Checkbox name="test" />);
    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls onChange handler when clicked", () => {
    const handleChange = vi.fn();
    render(<Checkbox name="test" onChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("initializes with defaultChecked value", () => {
    render(<Checkbox name="test" defaultChecked />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("passes additional props to input element", () => {
    render(
      <Checkbox
        name="test"
        data-testid="custom-checkbox"
        aria-describedby="help-text"
      />,
    );
    const checkbox = screen.getByTestId("custom-checkbox");
    expect(checkbox).toHaveAttribute("aria-describedby", "help-text");
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });
});
