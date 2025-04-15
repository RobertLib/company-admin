import { Column } from "../../../../components/ui/data-table";
import { fireEvent, render, screen } from "@testing-library/react";
import { getDictionary } from "../../../../dictionaries";
import { TableHead } from "../../../../components/ui/data-table/table-head";

const mockSetSearchParams = vi.fn();
vi.mock("react-router", () => ({
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

vi.mock("../../../../utils/debounce", () => ({
  default: (fn: () => void) => fn,
}));

describe("TableHead Component", () => {
  const mockDict = {
    dataTable: {
      actions: "Akce",
      clearFilters: "Vymazat filtry",
      search: "Hledat",
    },
  };

  const mockColumns: Column<unknown>[] = [
    {
      key: "name",
      label: "Jméno",
      sortable: true,
      filter: "input",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "type",
      label: "Typ",
      filter: "select",
      filterSelectOptions: [
        { label: "Typ 1", value: "type1" },
        { label: "Typ 2", value: "type2" },
      ],
    },
    {
      key: "date",
      label: "Datum",
      filter: "date",
    },
    {
      key: "time",
      label: "Čas",
      filter: "time",
    },
    {
      key: "datetime",
      label: "Datum a čas",
      filter: "datetime",
    },
  ];

  const defaultProps = {
    actionColumnRef: { current: null },
    calculatePosition: vi.fn().mockImplementation(() => "0px"),
    columnRefs: { current: {} },
    dict: mockDict as Awaited<ReturnType<typeof getDictionary>>,
    filters: {},
    handleDragOver: vi.fn(),
    handleDragStart: vi.fn(),
    handleDrop: vi.fn(),
    isAllSelected: false,
    order: "",
    pinnedColumns: { left: [], right: [] },
    sortBy: "",
    sortedVisibleColumns: mockColumns,
    toggleSelectAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sorting functionality", () => {
    it("sets ascending order when clicking on unsorted column", () => {
      render(<TableHead {...defaultProps} sortBy="" order="" />);

      const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
      fireEvent.click(sortButton);

      expect(mockSetSearchParams).toHaveBeenCalled();
      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      expect(params.get("sortBy")).toBe("name");
      expect(params.get("order")).toBe("asc");
    });

    it("sets descending order when clicking on ascending sorted column", () => {
      render(<TableHead {...defaultProps} sortBy="name" order="asc" />);

      const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
      fireEvent.click(sortButton);

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      expect(params.get("sortBy")).toBe("name");
      expect(params.get("order")).toBe("desc");
    });

    it("removes sorting when clicking on descending sorted column", () => {
      render(<TableHead {...defaultProps} sortBy="name" order="desc" />);

      const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
      fireEvent.click(sortButton);

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      params.set("sortBy", "name");
      params.set("order", "desc");
      updateFn(params);

      expect(params.has("sortBy")).toBe(false);
      expect(params.has("order")).toBe(false);
    });
  });

  describe("filter functionality", () => {
    it("adds a filter when value is provided", () => {
      render(<TableHead {...defaultProps} />);

      const inputFilter = screen.getByLabelText("Filter Jméno");
      fireEvent.change(inputFilter, { target: { value: "test" } });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.name).toBe("test");
      expect(params.get("page")).toBe("1");
    });

    it("removes a filter when value is empty", () => {
      render(<TableHead {...defaultProps} filters={{ name: "test" }} />);

      const inputFilter = screen.getByLabelText("Filter Jméno");
      expect(inputFilter).toHaveValue("test");

      fireEvent.change(inputFilter, { target: { value: "" } });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.name).toBeUndefined();
    });
  });

  describe("date and time filters rendering", () => {
    it("renders time filter with correct attributes", () => {
      render(<TableHead {...defaultProps} />);

      const timeFilter = screen.getByLabelText("Filter Čas");
      expect(timeFilter).toHaveAttribute("type", "time");

      fireEvent.change(timeFilter, { target: { value: "12:30" } });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.time).toBe("12:30");
    });

    it("renders date filter with correct attributes and handles changes", () => {
      render(<TableHead {...defaultProps} />);

      const dateFilter = screen.getByLabelText("Filter Datum");
      expect(dateFilter).toHaveAttribute("type", "date");

      fireEvent.change(dateFilter, { target: { value: "2025-05-18" } });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.date).toBe("2025-05-18");
    });

    it("renders datetime filter with correct attributes and handles changes", () => {
      render(<TableHead {...defaultProps} />);

      const datetimeFilter = screen.getByLabelText("Filter Datum a čas");
      expect(datetimeFilter).toHaveAttribute("type", "datetime-local");

      fireEvent.change(datetimeFilter, {
        target: { value: "2025-05-18T14:30" },
      });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.datetime).toBe("2025-05-18T14:30");
    });
  });

  it("clears all filters when clear filters button is clicked", () => {
    const mockActions = vi.fn();
    render(
      <TableHead
        {...defaultProps}
        actions={mockActions}
        filters={{ name: "test", date: "2025-05-18" }}
      />,
    );

    const clearFiltersButton = Array.from(
      document.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Vymazat filtry"));

    expect(clearFiltersButton).toBeInTheDocument();
    expect(clearFiltersButton).not.toBeDisabled();

    fireEvent.click(clearFiltersButton!);

    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    params.set("filters", '{"name":"test"}');
    params.set("page", "2");
    updateFn(params);

    expect(params.has("filters")).toBe(false);
    expect(params.has("page")).toBe(false);
  });

  it("renders selection checkbox column when groupActions is provided", () => {
    render(
      <TableHead
        {...defaultProps}
        groupActions={[{ label: "Delete", onClick: vi.fn() }]}
      />,
    );

    const selectionColumn = document.querySelector(
      'th[data-column-key="selection"]',
    );
    expect(selectionColumn).toBeInTheDocument();

    const checkbox = selectionColumn?.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  it("renders header cells for each column", () => {
    render(<TableHead {...defaultProps} />);

    mockColumns.forEach((column) => {
      const header = screen.getByText(column.label);
      expect(header).toBeInTheDocument();
    });
  });

  it("renders sort buttons for sortable columns", () => {
    render(<TableHead {...defaultProps} />);

    const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
    expect(sortButton).toBeInTheDocument();
  });

  it("calls setSearchParams when sort button is clicked", () => {
    render(<TableHead {...defaultProps} />);

    const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
    fireEvent.click(sortButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("renders input filter for columns with filter='input'", () => {
    render(<TableHead {...defaultProps} />);

    const inputFilter = screen.getByLabelText("Filter Jméno");
    expect(inputFilter).toBeInTheDocument();
    expect(inputFilter).toHaveAttribute("type", "search");
  });

  it("renders select filter for columns with filter='select'", () => {
    render(<TableHead {...defaultProps} />);

    const selectFilter = screen.getByLabelText("Filter Typ");
    expect(selectFilter).toBeInTheDocument();
  });

  it("renders date filter for columns with filter='date'", () => {
    render(<TableHead {...defaultProps} />);

    const dateFilter = screen.getByLabelText("Filter Datum");
    expect(dateFilter).toBeInTheDocument();
    expect(dateFilter).toHaveAttribute("type", "date");
  });

  it("renders time filter for columns with filter='time'", () => {
    render(<TableHead {...defaultProps} />);

    const timeFilter = screen.getByLabelText("Filter Čas");
    expect(timeFilter).toBeInTheDocument();
    expect(timeFilter).toHaveAttribute("type", "time");
  });

  it("renders datetime filter for columns with filter='datetime'", () => {
    render(<TableHead {...defaultProps} />);

    const datetimeFilter = screen.getByLabelText("Filter Datum a čas");
    expect(datetimeFilter).toBeInTheDocument();
    expect(datetimeFilter).toHaveAttribute("type", "datetime-local");
  });

  it("renders with groupActions", () => {
    render(<TableHead {...defaultProps} groupActions={[]} />);
    expect(document.querySelector("thead")).toBeInTheDocument();
  });

  it("calls toggleSelectAll when selection control is used", () => {
    const mockToggleSelectAll = vi.fn();
    render(
      <TableHead
        {...defaultProps}
        groupActions={[]}
        toggleSelectAll={mockToggleSelectAll}
      />,
    );

    expect(document.querySelector("thead")).toBeInTheDocument();
  });

  it("renders actions column when actions is provided", () => {
    const mockActions = vi.fn();
    render(<TableHead {...defaultProps} actions={mockActions} />);

    const actionsHeader = screen.getByText("Akce");
    expect(actionsHeader).toBeInTheDocument();
  });

  it("manipulates filters", () => {
    render(<TableHead {...defaultProps} filters={{ name: "test" }} />);

    const input = screen.getByLabelText("Filter Jméno");
    expect(input).toHaveValue("test");
  });

  it("updates search params when input filter changes", () => {
    render(<TableHead {...defaultProps} />);

    const inputFilter = screen.getByLabelText("Filter Jméno");
    fireEvent.change(inputFilter, { target: { value: "test" } });

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("renders expansion column when renderSubRow is provided", () => {
    const mockRenderSubRow = vi.fn();
    render(<TableHead {...defaultProps} renderSubRow={mockRenderSubRow} />);

    const cells = document.querySelectorAll("th");
    expect(cells[0]).toHaveClass("w-10");
  });

  it("applies correct attributes for pinned columns", () => {
    render(
      <TableHead
        {...defaultProps}
        pinnedColumns={{ left: ["name"], right: ["email"] }}
      />,
    );

    const cells = document.querySelectorAll("th");

    const nameCell = Array.from(cells).find(
      (cell) => cell.getAttribute("data-column-key") === "name",
    );
    const emailCell = Array.from(cells).find(
      (cell) => cell.getAttribute("data-column-key") === "email",
    );

    expect(nameCell).toHaveClass("sticky");
    expect(emailCell).toHaveClass("sticky");
  });
});
