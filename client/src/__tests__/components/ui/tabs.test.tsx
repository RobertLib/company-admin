import { LinkProps } from "react-router";
import { render, screen } from "@testing-library/react";
import Tabs from "../../../components/ui/tabs";

vi.mock("react-router", () => ({
  Link: ({ children, to, ...rest }: LinkProps) => (
    <a href={to.toString()} {...rest}>
      {children}
    </a>
  ),
  useLocation: () => ({
    pathname: "/dashboard",
  }),
}));

describe("Tabs Component", () => {
  const mockItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users", href: "/users" },
    { label: "Settings", href: "/settings" },
  ];

  it("renders correctly with required props", () => {
    render(<Tabs items={mockItems} />);

    mockItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("applies default classes to ul element", () => {
    const { container } = render(<Tabs items={mockItems} />);

    const ul = container.querySelector("ul");
    expect(ul).toHaveClass("inline-flex");
    expect(ul).toHaveClass("space-x-4");
    expect(ul).toHaveClass("rounded-md");
    expect(ul).toHaveClass("bg-gray-100");
    expect(ul).toHaveClass("p-1");
  });

  it("combines custom className with default classes", () => {
    const { container } = render(
      <Tabs items={mockItems} className="custom-class" />,
    );

    const ul = container.querySelector("ul");
    expect(ul).toHaveClass("custom-class");
    expect(ul).toHaveClass("inline-flex");
    expect(ul).toHaveClass("space-x-4");
  });

  it("applies active styles to the current tab", () => {
    render(<Tabs items={mockItems} />);

    const dashboardTab = screen.getByText("Dashboard").closest("li");
    const usersTab = screen.getByText("Users").closest("li");

    expect(dashboardTab).toHaveClass("bg-surface");
    expect(dashboardTab).toHaveClass("shadow");
    expect(dashboardTab).not.toHaveClass("text-gray-500");

    expect(usersTab).not.toHaveClass("bg-surface");
    expect(usersTab).not.toHaveClass("shadow");
    expect(usersTab).toHaveClass("text-gray-500");
  });

  it("creates links with correct hrefs", () => {
    render(<Tabs items={mockItems} />);

    mockItems.forEach((item) => {
      const link = screen.getByText(item.label).closest("a");
      expect(link).toHaveAttribute("href", item.href);
    });
  });

  it("applies correct styles to tab links", () => {
    render(<Tabs items={mockItems} />);

    mockItems.forEach((item) => {
      const link = screen.getByText(item.label);
      expect(link).toHaveClass("text-sm");
      expect(link).toHaveClass("font-medium");
    });
  });

  it("forwards additional props to the ul element", () => {
    render(
      <Tabs
        items={mockItems}
        data-testid="tabs-test"
        aria-label="Navigation tabs"
      />,
    );

    const tabsElement = screen.getByTestId("tabs-test");
    expect(tabsElement).toBeInTheDocument();
    expect(tabsElement).toHaveAttribute("aria-label", "Navigation tabs");
  });

  it("handles empty items array", () => {
    const { container } = render(<Tabs items={[]} />);
    const ul = container.querySelector("ul");
    expect(ul).toBeInTheDocument();
    expect(ul?.children.length).toBe(0);
  });
});
