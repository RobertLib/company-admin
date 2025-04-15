import { render, screen } from "@testing-library/react";
import Chip from "../../../components/ui/chip";

describe("Chip Component", () => {
  it("renders correctly with default styles", () => {
    render(<Chip>Test</Chip>);
    const chipElement = screen.getByText("Test");

    expect(chipElement).toBeInTheDocument();
    expect(chipElement).toHaveClass(
      "inline-block",
      "rounded-full",
      "border",
      "border-neutral-300",
      "px-2",
      "py-0.5",
      "text-sm",
    );
  });

  it("applies custom className", () => {
    render(<Chip className="bg-red-500 text-white">Test</Chip>);
    const chipElement = screen.getByText("Test");

    expect(chipElement).toHaveClass("bg-red-500", "text-white");
    expect(chipElement).toHaveClass("inline-block", "rounded-full");
  });

  it("renders children correctly", () => {
    render(
      <Chip>
        <span data-testid="child">Chip content</span>
      </Chip>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Chip content")).toBeInTheDocument();
  });

  it("passes additional props to div element", () => {
    render(<Chip title="Test title">Test</Chip>);
    const chipElement = screen.getByTestId("chip");

    expect(chipElement).toHaveAttribute("title", "Test title");
  });
});
