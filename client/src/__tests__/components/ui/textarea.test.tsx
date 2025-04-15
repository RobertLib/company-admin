import { fireEvent, render, screen } from "@testing-library/react";
import Textarea from "../../../components/ui/textarea";

describe("Textarea Component", () => {
  it("renders correctly with default props", () => {
    render(<Textarea name="test" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName.toLowerCase()).toBe("textarea");
  });

  it("renders with label", () => {
    render(<Textarea name="test" label="Test Label" />);
    const label = screen.getByText("Test Label:");
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe("label");

    const textarea = screen.getByLabelText("Test Label:");
    expect(textarea).toBeInTheDocument();
  });

  it("renders with required indicator when required is true", () => {
    render(<Textarea name="test" label="Required Field" required />);
    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass("text-danger-500");
  });

  it("displays error message when error prop is provided", () => {
    render(<Textarea name="test" error="This field is required" />);
    const errorMessage = screen.getByTestId("form-error");
    expect(errorMessage).toHaveTextContent("This field is required");
  });

  it("applies error styling when error prop is provided", () => {
    render(
      <Textarea name="test" error="Error message" data-testid="textarea" />,
    );
    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("border-danger-500!");
    expect(textarea.className).toContain("focus:ring-danger-300!");
  });

  it("applies custom className", () => {
    render(
      <Textarea name="test" className="custom-class" data-testid="textarea" />,
    );
    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("custom-class");
    expect(textarea.className).toContain("form-control");
  });

  it("sets correct attributes", () => {
    render(
      <Textarea
        name="test-area"
        required
        data-testid="textarea"
        placeholder="Enter text here"
      />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("name", "test-area");
    expect(textarea).toHaveAttribute("id", "test-area");
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute("placeholder", "Enter text here");
  });

  it("updates value when textarea changes", () => {
    const handleChange = vi.fn();
    render(
      <Textarea name="test" onChange={handleChange} data-testid="textarea" />,
    );
    const textarea = screen.getByTestId("textarea");

    fireEvent.change(textarea, { target: { value: "new value" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("applies default value", () => {
    render(
      <Textarea
        name="test"
        defaultValue="Default text"
        data-testid="textarea"
      />,
    );
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveValue("Default text");
  });

  it("passes additional props to textarea element", () => {
    render(
      <Textarea
        name="test"
        data-testid="textarea-test"
        rows={4}
        cols={50}
        maxLength={100}
        aria-describedby="description"
      />,
    );

    const textarea = screen.getByTestId("textarea-test");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveAttribute("cols", "50");
    expect(textarea).toHaveAttribute("maxLength", "100");
    expect(textarea).toHaveAttribute("aria-describedby", "description");
  });
});
