import { render, screen } from "@testing-library/react";
import Panel from "../../../components/ui/panel";

describe("Panel Component", () => {
  it("renders correctly with children", () => {
    render(
      <Panel data-testid="panel">
        <p>Panel content</p>
      </Panel>,
    );

    const panel = screen.getByTestId("panel");
    expect(panel).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("renders with title and subtitle", () => {
    render(
      <Panel title="Panel Title" subtitle="Panel Subtitle" data-testid="panel">
        <p>Panel content</p>
      </Panel>,
    );

    expect(screen.getByText("Panel Title")).toBeInTheDocument();
    expect(screen.getByText("Panel Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("renders with title only", () => {
    render(
      <Panel title="Panel Title" data-testid="panel">
        <p>Panel content</p>
      </Panel>,
    );

    expect(screen.getByText("Panel Title")).toBeInTheDocument();
    expect(screen.queryByText("Panel Subtitle")).not.toBeInTheDocument();
  });

  it("renders with subtitle only", () => {
    render(
      <Panel subtitle="Panel Subtitle" data-testid="panel">
        <p>Panel content</p>
      </Panel>,
    );

    expect(screen.queryByText("Panel Title")).not.toBeInTheDocument();
    expect(screen.getByText("Panel Subtitle")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    render(<Panel data-testid="panel">Content</Panel>);

    const panel = screen.getByTestId("panel");
    expect(panel).toHaveClass("bg-surface");
    expect(panel).toHaveClass("rounded-lg");
    expect(panel).toHaveClass("border");
    expect(panel).toHaveClass("border-neutral-200");
    expect(panel).toHaveClass("p-6");
    expect(panel).toHaveClass("shadow-xs");
  });

  it("combines custom className with default classes", () => {
    render(
      <Panel data-testid="panel" className="custom-class">
        Content
      </Panel>,
    );

    const panel = screen.getByTestId("panel");
    expect(panel).toHaveClass("custom-class");
    expect(panel).toHaveClass("bg-surface");
  });

  it("applies correct classes to title", () => {
    render(<Panel title="Panel Title">Content</Panel>);

    const title = screen.getByText("Panel Title");
    expect(title.tagName).toBe("H2");
    expect(title).toHaveClass("mb-1");
    expect(title).toHaveClass("text-2xl");
    expect(title).toHaveClass("font-bold");
  });

  it("applies correct classes to subtitle", () => {
    render(<Panel subtitle="Panel Subtitle">Content</Panel>);

    const subtitle = screen.getByText("Panel Subtitle");
    expect(subtitle.tagName).toBe("P");
    expect(subtitle).toHaveClass("mb-5");
    expect(subtitle).toHaveClass("text-gray-500");
  });

  it("forwards additional props to div element", () => {
    render(
      <Panel data-testid="panel-test" aria-label="Panel component">
        Content
      </Panel>,
    );

    const panel = screen.getByTestId("panel-test");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute("aria-label", "Panel component");
  });
});
