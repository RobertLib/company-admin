import { render, screen } from "@testing-library/react";
import DescriptionList from "../../../components/ui/description-list";

describe("DescriptionList Component", () => {
  const mockItems = [
    { term: "Name", description: "John Doe" },
    { term: "Email", description: "john@example.com" },
    { term: "Phone", description: null },
    { term: "Address", description: undefined },
  ];

  it("renders terms and descriptions correctly", () => {
    render(<DescriptionList items={mockItems} />);

    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("renders placeholders for null/undefined descriptions", () => {
    render(<DescriptionList items={mockItems} />);

    const placeholders = document.querySelectorAll(".animate-pulse");
    expect(placeholders.length).toBe(2);

    placeholders.forEach((placeholder) => {
      expect(placeholder).toHaveClass(
        "h-4",
        "animate-pulse",
        "rounded",
        "bg-gray-200",
      );
    });
  });

  it("applies different placeholder widths based on index", () => {
    render(<DescriptionList items={mockItems} />);

    const placeholders = document.querySelectorAll(".animate-pulse");
    expect(placeholders[0]).toHaveClass("w-26");
    expect(placeholders[1]).toHaveClass("w-38");
  });

  it("applies custom className", () => {
    render(<DescriptionList items={mockItems} className="custom-class" />);

    const dlElement = document.querySelector("dl");
    expect(dlElement).toHaveClass("custom-class");
    expect(dlElement).toHaveClass("grid", "grid-cols-1", "gap-y-3");
  });

  it("passes additional props to dl element", () => {
    render(
      <DescriptionList
        items={mockItems}
        data-testid="test-list"
        aria-label="Description list"
      />,
    );

    const dlElement = screen.getByTestId("test-list");
    expect(dlElement).toHaveAttribute("aria-label", "Description list");
  });
});
