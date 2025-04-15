import { fireEvent, render, screen } from "@testing-library/react";
import { TableFooter } from "../../../../components/ui/data-table/table-footer";

const mockSetSearchParams = vi.fn();
vi.mock("react-router", () => ({
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

describe("TableFooter Component", () => {
  const defaultProps = {
    limit: 10,
    page: 2,
    total: 50,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    render(<TableFooter {...defaultProps} />);

    const limitSelect = screen.getByLabelText("Rows per page");
    expect(limitSelect).toBeInTheDocument();
    expect(limitSelect).toHaveValue("10");

    const pagination = screen.getByRole("navigation", { name: "Pagination" });
    expect(pagination).toBeInTheDocument();

    const paginationTotal = screen.getByText("2 / 5");
    expect(paginationTotal).toBeInTheDocument();
  });

  it("updates URL search params when limit is changed", () => {
    render(<TableFooter {...defaultProps} />);

    const limitSelect = screen.getByLabelText("Rows per page");
    fireEvent.change(limitSelect, { target: { value: "20" } });

    expect(mockSetSearchParams).toHaveBeenCalled();

    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    updateFn(params);

    expect(params.get("limit")).toBe("20");
  });

  it("updates URL search params when page is changed", () => {
    render(<TableFooter {...defaultProps} />);

    const nextButton = screen.getByRole("button", { name: "Go to next page" });
    fireEvent.click(nextButton);

    expect(mockSetSearchParams).toHaveBeenCalled();

    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    updateFn(params);

    expect(params.get("page")).toBe("3");
  });

  it("renders without total", () => {
    const propsWithoutTotal = {
      limit: defaultProps.limit,
      page: defaultProps.page,
    };
    render(<TableFooter {...propsWithoutTotal} />);

    const paginationTotal = screen.getByText("2 / 1");
    expect(paginationTotal).toBeInTheDocument();
  });
});
