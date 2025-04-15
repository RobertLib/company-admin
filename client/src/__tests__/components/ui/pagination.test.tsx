import { fireEvent, render, screen } from "@testing-library/react";
import Pagination from "../../../components/ui/pagination";

describe("Pagination Component", () => {
  it("renders correctly with required props", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} onChange={onChange} />);

    expect(screen.getByLabelText("Pagination")).toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });

  it("calculates total pages correctly", () => {
    const onChange = vi.fn();
    render(<Pagination page={2} onChange={onChange} total={30} limit={10} />);

    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("disables first and previous buttons on first page", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} onChange={onChange} total={30} limit={10} />);

    expect(screen.getByLabelText("Go to first page")).toBeDisabled();
    expect(screen.getByLabelText("Go to previous page")).toBeDisabled();
    expect(screen.getByLabelText("Go to next page")).not.toBeDisabled();
  });

  it("disables next button on last page", () => {
    const onChange = vi.fn();
    render(<Pagination page={3} onChange={onChange} total={30} limit={10} />);

    expect(screen.getByLabelText("Go to first page")).not.toBeDisabled();
    expect(screen.getByLabelText("Go to previous page")).not.toBeDisabled();
    expect(screen.getByLabelText("Go to next page")).toBeDisabled();
  });

  it("disables next button when total or limit is undefined", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} onChange={onChange} />);

    expect(screen.getByLabelText("Go to next page")).toBeDisabled();
  });

  it("calls onChange with correct page when buttons are clicked", () => {
    const onChange = vi.fn();
    render(<Pagination page={2} onChange={onChange} total={30} limit={10} />);

    fireEvent.click(screen.getByLabelText("Go to first page"));
    expect(onChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText("Go to previous page"));
    expect(onChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText("Go to next page"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("applies custom className", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Pagination page={1} onChange={onChange} className="custom-class" />,
    );

    const ul = container.querySelector("ul");
    expect(ul).toHaveClass("custom-class");
    expect(ul).toHaveClass("flex");
    expect(ul).toHaveClass("items-center");
    expect(ul).toHaveClass("gap-1.5");
  });

  it("passes additional props to ul element", () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={1}
        onChange={onChange}
        data-testid="pagination-test"
        aria-label="Custom pagination"
      />,
    );

    const ul = screen.getByTestId("pagination-test");
    expect(ul).toBeInTheDocument();
    expect(ul).toHaveAttribute("aria-label", "Custom pagination");
  });
});
