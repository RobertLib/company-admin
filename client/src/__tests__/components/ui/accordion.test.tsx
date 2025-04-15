import { render, screen } from "@testing-library/react";
import Accordion from "../../../components/ui/accordion";

describe("Accordion Component", () => {
  it("renders correctly with required props", () => {
    render(<Accordion summary="Test Summary">Content</Accordion>);

    const summary = screen.getByText("Test Summary");
    expect(summary).toBeInTheDocument();
    expect(summary.tagName.toLowerCase()).toBe("summary");

    const content = screen.getByText("Content");
    expect(content).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(
      <Accordion summary="Title">
        <p>Paragraph content</p>
        <span>Span content</span>
      </Accordion>,
    );

    expect(screen.getByText("Paragraph content")).toBeInTheDocument();
    expect(screen.getByText("Span content")).toBeInTheDocument();
  });

  it("passes additional props to details element", () => {
    render(
      <Accordion
        summary="Test"
        className="custom-class"
        data-testid="my-accordion"
        open
      >
        Content
      </Accordion>,
    );

    const details = screen.getByTestId("my-accordion");
    expect(details.tagName.toLowerCase()).toBe("details");
    expect(details).toHaveClass("custom-class");
    expect(details).toHaveAttribute("open");
  });
});
