import { fireEvent, render, screen } from "@testing-library/react";
import RadioGroup from "../../../components/ui/radio-group";

describe("RadioGroup Component", () => {
  const mockOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  it("renders correctly with required props", () => {
    render(<RadioGroup name="test-group" options={mockOptions} />);

    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });

    const radioInputs = screen.getAllByRole("radio");
    expect(radioInputs).toHaveLength(3);
    expect(radioInputs[0]).toHaveAttribute("name", "test-group");
  });

  it("renders with label", () => {
    render(
      <RadioGroup name="test-group" options={mockOptions} label="Test Label" />,
    );

    expect(screen.getByText("Test Label:")).toBeInTheDocument();
  });

  it("shows required indicator when required prop is true", () => {
    render(
      <RadioGroup
        name="test-group"
        options={mockOptions}
        label="Test Label"
        required
      />,
    );

    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toHaveClass("text-danger-500");
  });

  it("shows error message when error prop is provided", () => {
    render(
      <RadioGroup
        name="test-group"
        options={mockOptions}
        error="This field is required"
      />,
    );

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toHaveTextContent("This field is required");
  });

  it("selects option with defaultValue", () => {
    render(
      <RadioGroup
        name="test-group"
        options={mockOptions}
        defaultValue="option2"
      />,
    );

    const radioInputs = screen.getAllByRole("radio");
    expect(radioInputs[1]).toBeChecked();
  });

  it("calls onChange when option is selected", () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup
        name="test-group"
        options={mockOptions}
        onChange={handleChange}
      />,
    );

    const radioInputs = screen.getAllByRole("radio");
    fireEvent.click(radioInputs[1]);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0].target.value).toBe("option2");
  });

  it("updates internal state when option is selected", () => {
    render(<RadioGroup name="test-group" options={mockOptions} />);

    const radioInputs = screen.getAllByRole("radio");
    fireEvent.click(radioInputs[2]);

    expect(radioInputs[2]).toBeChecked();
  });

  it("applies required attribute to inputs when required prop is true", () => {
    render(
      <RadioGroup name="test-group" options={mockOptions} required={true} />,
    );

    const radioInputs = screen.getAllByRole("radio");
    radioInputs.forEach((input) => {
      expect(input).toBeRequired();
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <RadioGroup
        name="test-group"
        options={mockOptions}
        className="custom-class"
      />,
    );

    const radioGroupElement = container.firstChild;
    expect(radioGroupElement).toHaveClass("custom-class");
    expect(radioGroupElement).toHaveClass("flex");
    expect(radioGroupElement).toHaveClass("flex-col");
    expect(radioGroupElement).toHaveClass("gap-1.5");
  });

  it("forwards additional props to the div element", () => {
    render(
      <RadioGroup
        name="test-group"
        options={mockOptions}
        data-testid="radio-group-test"
        aria-labelledby="test-label"
      />,
    );

    const radioGroupElement = screen.getByTestId("radio-group-test");
    expect(radioGroupElement).toBeInTheDocument();
    expect(radioGroupElement).toHaveAttribute("aria-labelledby", "test-label");
  });
});
