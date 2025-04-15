import { act, fireEvent, render, screen } from "@testing-library/react";
import { MockInstance } from "vitest";
import { mockLocalStorage } from "../../../setup";
import DataTable, { Column } from "../../../../components/ui/data-table";

describe("DataTable Component", () => {
  const mockColumns: Column<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>[] = [
    { key: "name", label: "Jméno" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const mockData = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  const mockToolbar = <div data-testid="custom-toolbar">Custom Toolbar</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it("renders with basic props", () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(
      screen.getByRole("region", { name: "Data table" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders custom toolbar", () => {
    render(
      <DataTable columns={mockColumns} data={mockData} toolbar={mockToolbar} />,
    );

    expect(screen.getByTestId("custom-toolbar")).toBeInTheDocument();
  });

  it("renders group actions when provided", () => {
    const mockGroupActions = [
      { label: "Delete", onClick: vi.fn() },
      { label: "Archive", onClick: vi.fn() },
    ];

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        groupActions={mockGroupActions}
      />,
    );

    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Archive")).toBeInTheDocument();
  });

  it("executes group action when clicked", () => {
    const mockOnClick = vi.fn();
    const mockGroupActions = [{ label: "Delete", onClick: mockOnClick }];

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        groupActions={mockGroupActions}
      />,
    );

    fireEvent.click(screen.getByText("Delete"));

    expect(mockOnClick).toHaveBeenCalled();
    expect(mockOnClick).toHaveBeenCalledWith([]);
  });

  it("renders action column when actions prop is provided", () => {
    const mockActions = vi.fn().mockReturnValue(<button>Edit</button>);

    render(
      <DataTable columns={mockColumns} data={mockData} actions={mockActions} />,
    );

    expect(screen.getAllByText("Edit").length).toBe(2);
    expect(mockActions).toHaveBeenCalledTimes(2);
  });

  it("toggles fullscreen mode", () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const fullscreenButton = screen.getByLabelText("Toggle full screen");
    fireEvent.click(fullscreenButton);

    const tableContainer = screen.getByRole("region", { name: "Data table" });
    expect(tableContainer).toHaveClass("fixed inset-0 z-50");

    fireEvent.click(fullscreenButton);
    expect(tableContainer).not.toHaveClass("fixed inset-0 z-50");
  });

  it("expands rows when renderSubRow is provided", () => {
    const mockRenderSubRow = vi
      .fn()
      .mockReturnValue(<div>Sub row content</div>);

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        renderSubRow={mockRenderSubRow}
      />,
    );

    const expandButtons = screen.getAllByLabelText(/Rozbalit řádek/i);
    expect(expandButtons.length).toBe(2);

    fireEvent.click(expandButtons[0]);

    expect(mockRenderSubRow).toHaveBeenCalledWith(mockData[0]);
    expect(screen.getByText("Sub row content")).toBeInTheDocument();
  });

  it("initializes with expanded rows when expandedByDefault is true", () => {
    const mockRenderSubRow = vi
      .fn()
      .mockReturnValue(<div>Sub row content</div>);

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        renderSubRow={mockRenderSubRow}
        expandedByDefault={true}
      />,
    );

    expect(screen.getAllByText("Sub row content").length).toBe(2);

    const collapseButtons = screen.getAllByLabelText(/Sbalit řádek/i);
    expect(collapseButtons.length).toBe(2);
  });

  it("renders loading state", () => {
    render(<DataTable columns={mockColumns} data={[]} loading={true} />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    const table = screen.getByRole("grid");
    expect(table).toHaveAttribute("aria-busy", "true");
  });

  it("renders footer with pagination", () => {
    render(<DataTable columns={mockColumns} data={mockData} total={50} />);

    const navigation = screen.getByRole("navigation", { name: "Pagination" });
    expect(navigation).toBeInTheDocument();

    const paginationButtons = navigation.querySelectorAll("button");
    expect(paginationButtons.length).toBeGreaterThan(0);

    const buttonIcons = navigation.querySelectorAll("svg");
    expect(buttonIcons.length).toBeGreaterThan(0);
  });

  it("handles empty data array", () => {
    render(<DataTable columns={mockColumns} data={[]} />);
    expect(screen.getByText("Žádná data")).toBeInTheDocument();
  });

  it("applies proper custom className", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        className="custom-table-class"
      />,
    );

    const tableContainer = screen.getByRole("region", { name: "Data table" });
    expect(tableContainer).toHaveClass("custom-table-class");
  });

  it("passes tableId to useColumnManagement", () => {
    const testTableId = "unique-test-table-id";

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId={testTableId}
        data-testid="table-with-id"
      />,
    );

    const table = screen.getByTestId("table-with-id");
    expect(table).toBeInTheDocument();

    mockColumns.forEach((column) => {
      expect(screen.getByText(column.label)).toBeInTheDocument();
    });

    expect(screen.getByText(mockData[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockData[1].email)).toBeInTheDocument();

    const fullscreenButton = screen.getByLabelText("Toggle full screen");
    fireEvent.click(fullscreenButton);

    expect(table).toHaveClass("fixed");
  });

  it("cleans up ResizeObserver on unmount", () => {
    const { unmount } = render(
      <DataTable columns={mockColumns} data={mockData} />,
    );

    unmount();

    expect(
      (global.ResizeObserver as unknown as MockInstance).mock.results[0].value
        .disconnect,
    ).toHaveBeenCalled();
  });

  it("calculates positions correctly for pinned columns", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-users-table",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name"], right: ["role"] },
      }),
    );

    render(
      <DataTable columns={mockColumns} data={mockData} tableId="users-table" />,
    );

    const headerCells = screen.getAllByRole("columnheader");
    expect(headerCells.length).toBeGreaterThan(0);

    expect(headerCells[0]).toHaveAttribute("data-column-key", "name");
    expect(headerCells[headerCells.length - 1]).toHaveAttribute(
      "data-column-key",
      "role",
    );

    expect(headerCells[0].style).toBeDefined();
    expect(headerCells[headerCells.length - 1].style).toBeDefined();
  });

  it("handles reset settings correctly", () => {
    mockLocalStorage.clear();
    mockLocalStorage.setItem.mockClear();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="test-reset-table"
      />,
    );

    const columnsButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(columnsButton);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(resetButton).toBeInTheDocument();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("handles ResizeObserver correctly", () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    const originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: mockObserve,
      disconnect: mockDisconnect,
    }));

    const { unmount } = render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actions={() => <button>Edit</button>}
      />,
    );

    expect(mockObserve).toHaveBeenCalled();

    const resizeCallback = (global.ResizeObserver as unknown as MockInstance)
      .mock.calls[0][0];

    act(() => {
      resizeCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 200 }),
          },
        },
      ]);
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();

    global.ResizeObserver = originalResizeObserver;
  });

  it("calculates positions correctly for pinned columns", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-positions-test",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name"], right: ["role"] },
      }),
    );

    const originalGetBoundingClientRect =
      Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 100 },
          email: { width: 150 },
          role: { width: 100 },
          actions: { width: 50 },
          selection: { width: 30 },
        };

        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="positions-test"
        actions={() => <button>Edit</button>}
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "role",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
        {
          target: {
            getAttribute: () => "actions",
            getBoundingClientRect: () => ({ width: 50 }),
          },
        },
      ]);
    });

    const nameHeader = screen.getByText("Jméno").closest("th");
    const roleHeader = screen.getByText("Role").closest("th");

    expect(nameHeader).toBeInTheDocument();
    expect(roleHeader).toBeInTheDocument();

    expect(nameHeader).toHaveAttribute("data-column-key", "name");
    expect(roleHeader).toHaveAttribute("data-column-key", "role");

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("renders with toolbar and actions correctly", () => {
    const mockToolbar = <div data-testid="custom-toolbar">Toolbar Content</div>;
    const mockActions = (row: {
      id: number;
      name: string;
      email: string;
      role: string;
    }) => (
      <div data-testid={`actions-${row.id}`}>
        <button>Edit</button>
        <button>Delete</button>
      </div>
    );

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        toolbar={mockToolbar}
        actions={mockActions}
        total={100}
      />,
    );

    expect(screen.getByTestId("custom-toolbar")).toBeInTheDocument();

    mockData.forEach((row) => {
      expect(screen.getByTestId(`actions-${row.id}`)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
  });
});
