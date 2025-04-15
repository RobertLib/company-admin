import { render, screen } from "@testing-library/react";
import Navbar from "../../../components/ui/navbar";

describe("Navbar Component", () => {
  it("renders correctly with default props", () => {
    const { container } = render(<Navbar />);

    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();

    expect(screen.getByText("Company Admin")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Navbar className="custom-class" />);

    const nav = container.querySelector("nav") as HTMLElement;
    expect(nav.className).toContain("custom-class");
    expect(nav.className).toContain("flex");
    expect(nav.className).toContain("items-center");
    expect(nav.className).toContain("justify-between");
  });

  it("passes additional props to nav element", () => {
    render(<Navbar data-testid="test-navbar" aria-label="Main navigation" />);

    const navElement = screen.getByTestId("test-navbar");
    expect(navElement).toBeInTheDocument();
    expect(navElement).toHaveAttribute("aria-label", "Main navigation");
  });
});
