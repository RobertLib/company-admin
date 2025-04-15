import { Column, GroupAction } from "../../../../components/ui/data-table";
import { fireEvent, render, screen } from "@testing-library/react";
import { getDictionary } from "../../../../dictionaries";
import { TableBody } from "../../../../components/ui/data-table/table-body";

describe("TableBody Component", () => {
  const mockDict = {
    dataTable: {
      noData: "No data available",
      expandRow: "Expand row",
      collapseRow: "Collapse row",
    },
  };

  const mockColumns: Column<unknown>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const mockData = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  const mockCalculatePosition = vi.fn().mockImplementation((_, position) => {
    if (position === "left") return "0px";
    return "0px";
  });

  const mockToggleRowExpansion = vi.fn();
  const mockToggleRowSelection = vi.fn();
  const mockActions = vi.fn().mockReturnValue(<button>Actions</button>);
  const mockRenderSubRow = vi.fn().mockReturnValue(<div>Sub row content</div>);

  const defaultProps = {
    calculatePosition: mockCalculatePosition,
    data: mockData,
    dict: mockDict as Awaited<ReturnType<typeof getDictionary>>,
    expandedRows: new Set<number>(),
    filters: {},
    pinnedColumns: { left: [], right: [] },
    selectedRows: [],
    sortedVisibleColumns: mockColumns,
    toggleRowExpansion: mockToggleRowExpansion,
    toggleRowSelection: mockToggleRowSelection,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders rows with data correctly", () => {
    render(<TableBody {...defaultProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders no data message when data is empty and not loading", () => {
    render(<TableBody {...defaultProps} data={[]} loading={false} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders loading spinner when data is empty and loading is true", () => {
    render(<TableBody {...defaultProps} data={[]} loading={true} />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    const skeletonRows = document.querySelectorAll("tr");
    expect(skeletonRows.length).toBe(11);
  });

  it("renders expansion controls when renderSubRow is provided", () => {
    render(<TableBody {...defaultProps} renderSubRow={mockRenderSubRow} />);

    const expandButtons = screen.getAllByRole("button", {
      name: /expand row/i,
    });
    expect(expandButtons.length).toBe(2);
  });

  it("toggles row expansion when expand button is clicked", () => {
    render(<TableBody {...defaultProps} renderSubRow={mockRenderSubRow} />);

    const expandButtons = screen.getAllByRole("button", {
      name: /expand row/i,
    });
    fireEvent.click(expandButtons[0]);

    expect(mockToggleRowExpansion).toHaveBeenCalledWith(1);
  });

  it("renders sub row content when row is expanded", () => {
    const expandedRows = new Set<number>([1]);
    render(
      <TableBody
        {...defaultProps}
        expandedRows={expandedRows}
        renderSubRow={mockRenderSubRow}
      />,
    );

    expect(screen.getByText("Sub row content")).toBeInTheDocument();
    expect(mockRenderSubRow).toHaveBeenCalledWith(mockData[0]);
  });

  it("renders checkboxes for row selection when groupActions is provided", () => {
    const mockGroupActions: GroupAction<unknown>[] = [
      { label: "Delete", onClick: vi.fn() },
    ];

    render(<TableBody {...defaultProps} groupActions={mockGroupActions} />);

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
  });

  it("calls toggleRowSelection when checkbox is clicked", () => {
    const mockGroupActions: GroupAction<unknown>[] = [
      { label: "Delete", onClick: vi.fn() },
    ];

    render(<TableBody {...defaultProps} groupActions={mockGroupActions} />);

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(checkboxes[0]);

    expect(mockToggleRowSelection).toHaveBeenCalledWith(mockData[0]);
  });

  it("renders action column when actions prop is provided", () => {
    render(<TableBody {...defaultProps} actions={mockActions} />);

    expect(screen.getAllByText("Actions").length).toBe(2);
    expect(mockActions).toHaveBeenCalledTimes(2);
  });

  it("applies the correct colspan to the 'no data' cell", () => {
    render(<TableBody {...defaultProps} data={[]} loading={false} />);

    const td = screen.getByText("No data available").closest("td");
    expect(td).toHaveAttribute("colspan", "3");
  });

  it("applies proper styles to pinned columns", () => {
    render(
      <TableBody
        {...defaultProps}
        pinnedColumns={{ left: ["name"], right: [] }}
      />,
    );

    const nameCell = screen.getByText("John Doe").closest("td");
    expect(nameCell).toHaveClass("sticky");
  });

  it("applies correct colspan to expanded row content", () => {
    const expandedRows = new Set<number>([1]);
    render(
      <TableBody
        {...defaultProps}
        expandedRows={expandedRows}
        renderSubRow={mockRenderSubRow}
      />,
    );

    const expandedRowCell = screen.getByText("Sub row content").closest("td");
    expect(expandedRowCell).toHaveAttribute("colspan", "4");
  });

  it("truncates long text and renders with popover", async () => {
    const longTextData = [
      {
        id: 1,
        name: "A".repeat(100),
        email: "john@example.com",
        role: "Admin",
      },
    ];

    render(<TableBody {...defaultProps} data={longTextData} />);

    const truncatedText = screen.getByText(/AAAAA.*\.\.\./);
    expect(truncatedText.textContent).toContain("A".repeat(80));
    expect(truncatedText.textContent).toContain("...");

    const popoverTrigger = screen.getByTestId("popover-trigger");
    fireEvent.mouseEnter(popoverTrigger);

    const popoverContent = await screen.findByTestId("popover-content");
    expect(popoverContent.textContent).toBe("A".repeat(100));
  });

  it("highlights text that matches filter criteria", () => {
    render(<TableBody {...defaultProps} filters={{ name: "John" }} />);

    const cells = document.querySelectorAll("td");
    let foundHighlightedCell = false;

    for (const cell of cells) {
      if (cell.innerHTML.includes("<b>John</b>")) {
        foundHighlightedCell = true;
        break;
      }
    }

    expect(foundHighlightedCell).toBe(true);
  });

  it("uses custom render function for columns when provided", () => {
    const customColumns: Column<unknown>[] = [
      {
        key: "custom",
        label: "Custom",
        render: () => <span data-testid="custom-content">Custom Content</span>,
      },
      ...mockColumns,
    ];

    render(
      <TableBody {...defaultProps} sortedVisibleColumns={customColumns} />,
    );

    expect(screen.getAllByTestId("custom-content").length).toBe(2);
  });
});
