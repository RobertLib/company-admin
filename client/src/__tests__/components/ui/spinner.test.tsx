import { render, screen } from "@testing-library/react";
import Spinner from "../../../components/ui/spinner";

describe("Spinner Component", () => {
  it("renders correctly", () => {
    render(<Spinner data-testid="spinner" />);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("contains SVG element", () => {
    const { container } = render(<Spinner />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
    expect(svg).toHaveClass("h-6");
    expect(svg).toHaveClass("w-6");
  });

  it("applies default classes", () => {
    render(<Spinner data-testid="spinner" />);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toHaveClass("flex");
    expect(spinner).toHaveClass("items-center");
    expect(spinner).toHaveClass("justify-center");
  });

  it("combines custom className with default classes", () => {
    render(<Spinner className="custom-class" data-testid="spinner" />);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toHaveClass("custom-class");
    expect(spinner).toHaveClass("flex");
    expect(spinner).toHaveClass("items-center");
    expect(spinner).toHaveClass("justify-center");
  });

  it("forwards additional props to div element", () => {
    render(<Spinner aria-label="Loading" role="status" />);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Loading");
    expect(spinner).toHaveAttribute("role", "status");
  });

  it("has correct SVG structure", () => {
    const { container } = render(<Spinner />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");

    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveClass("opacity-25");
    expect(circle).toHaveAttribute("cx", "12");
    expect(circle).toHaveAttribute("cy", "12");
    expect(circle).toHaveAttribute("r", "10");

    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass("opacity-75");
  });
});
