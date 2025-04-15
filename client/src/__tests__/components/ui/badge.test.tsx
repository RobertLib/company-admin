import { render, screen } from "@testing-library/react";
import Badge from "../../../components/ui/badge";

describe("Badge Component", () => {
  it("renders correctly with required props", () => {
    render(<Badge count={5}>Notifications</Badge>);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("5")).toHaveClass("bg-red-500");

    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("renders correct badge count", () => {
    const { rerender } = render(<Badge count={10}>Item</Badge>);
    expect(screen.getByText("10")).toBeInTheDocument();

    rerender(<Badge count={999}>Item</Badge>);
    expect(screen.getByText("999")).toBeInTheDocument();

    rerender(<Badge count={0}>Item</Badge>);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(
      <Badge count={1}>
        <div data-testid="child">Test Content</div>
      </Badge>,
    );

    const childElement = screen.getByTestId("child");
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent("Test Content");
  });

  it("applies custom className to the container", () => {
    const { container } = render(
      <Badge count={3} className="custom-class">
        Content
      </Badge>,
    );

    const badgeContainer = container.firstChild;
    expect(badgeContainer).toHaveClass("relative");
    expect(badgeContainer).toHaveClass("inline-block");
    expect(badgeContainer).toHaveClass("custom-class");
  });

  it("passes additional props to the container div", () => {
    render(
      <Badge
        count={2}
        data-testid="badge-container"
        aria-label="2 unread notifications"
      >
        Inbox
      </Badge>,
    );

    const badgeContainer = screen.getByTestId("badge-container");
    expect(badgeContainer).toHaveAttribute(
      "aria-label",
      "2 unread notifications",
    );
  });

  it("positions the badge correctly", () => {
    render(<Badge count={5}>Item</Badge>);

    const badgeCountElement = screen.getByText("5");
    expect(badgeCountElement).toHaveClass("absolute");
    expect(badgeCountElement).toHaveClass("-top-2");
    expect(badgeCountElement).toHaveClass("-right-2");
  });
});
