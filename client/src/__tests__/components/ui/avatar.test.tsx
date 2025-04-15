import { render, screen } from "@testing-library/react";
import Avatar from "../../../components/ui/avatar";

describe("Avatar Component", () => {
  it("renders correctly with default props", () => {
    const { container } = render(<Avatar />);
    const avatarContainer = container.firstChild;
    expect(avatarContainer).toHaveClass("inline-block");
    expect(avatarContainer).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Avatar className="custom-class" />);
    const avatarContainer = container.firstChild;
    expect(avatarContainer).toHaveClass("inline-block");
    expect(avatarContainer).toHaveClass("custom-class");
  });

  it("passes additional props to div element", () => {
    render(
      <Avatar data-testid="avatar-element" aria-label="Profile picture" />,
    );

    const avatarContainer = screen.getByTestId("avatar-element");
    expect(avatarContainer).toBeInTheDocument();
    expect(avatarContainer).toHaveAttribute("aria-label", "Profile picture");
  });

  it("renders UserCircle icon as SVG", () => {
    const { container } = render(<Avatar />);
    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
  });

  it("renders SVG icon with correct size", () => {
    const { container } = render(<Avatar />);
    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveAttribute("width", "24");
    expect(svgElement).toHaveAttribute("height", "24");
  });
});
