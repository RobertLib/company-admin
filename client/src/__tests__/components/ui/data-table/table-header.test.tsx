import { Column } from "../../../../components/ui/data-table";
import { fireEvent, render, screen } from "@testing-library/react";
import { TableHeader } from "../../../../components/ui/data-table/table-header";

describe("TableHeader Component", () => {
  const mockColumns: Column<unknown>[] = [
    { key: "name", label: "Jméno" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const defaultProps = {
    columnOrder: ["name", "email", "role"],
    columns: mockColumns,
    columnVisibility: { name: true, email: true, role: true },
    handleDragOver: vi.fn(),
    handleDragStart: vi.fn(),
    handleDrop: vi.fn(),
    handlePinColumn: vi.fn(),
    isFullScreen: false,
    onResetSettings: vi.fn(),
    pinnedColumns: { left: [], right: [] },
    setColumnVisibility: vi.fn(),
    setIsFullScreen: vi.fn(),
    toolbar: <div data-testid="toolbar">Toolbar Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    render(<TableHeader {...defaultProps} />);

    expect(screen.getByTestId("toolbar")).toBeInTheDocument();

    expect(
      screen.getByLabelText("Toggle column visibility"),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Toggle full screen")).toBeInTheDocument();
  });

  it("toggles fullscreen mode when button is clicked", () => {
    render(<TableHeader {...defaultProps} />);

    const fullscreenButton = screen.getByLabelText("Toggle full screen");
    fireEvent.click(fullscreenButton);

    expect(defaultProps.setIsFullScreen).toHaveBeenCalled();
  });

  it("displays the correct icon based on fullscreen state", () => {
    render(<TableHeader {...defaultProps} isFullScreen={false} />);
    expect(document.querySelector("svg.lucide-maximize")).toBeInTheDocument();

    render(<TableHeader {...defaultProps} isFullScreen={true} />);
    expect(document.querySelector("svg.lucide-minimize")).toBeInTheDocument();
  });

  it("disables reset button when no custom settings are present", () => {
    render(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const resetButton = screen.getByText("Reset");
    expect(resetButton).toBeDisabled();
  });

  it("enables reset button when custom settings are present", () => {
    const customProps = {
      ...defaultProps,
      columnOrder: ["email", "name", "role"],
      columnVisibility: { name: true, email: false, role: true },
      pinnedColumns: { left: ["name"], right: [] },
    };

    render(<TableHeader {...customProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const resetButton = screen.getByText("Reset");
    expect(resetButton).not.toBeDisabled();
  });

  it("calls onResetSettings when reset button is clicked", () => {
    const customProps = {
      ...defaultProps,
      columnOrder: ["email", "name", "role"],
    };

    render(<TableHeader {...customProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(defaultProps.onResetSettings).toHaveBeenCalled();
  });

  it("calls handlePinColumn when pin buttons are clicked", () => {
    render(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const pinLeftButton = screen.getByLabelText("Pin column Jméno to left");
    fireEvent.click(pinLeftButton);

    expect(defaultProps.handlePinColumn).toHaveBeenCalledWith("name", "left");

    const pinRightButton = screen.getByLabelText("Pin column Jméno to right");
    fireEvent.click(pinRightButton);

    expect(defaultProps.handlePinColumn).toHaveBeenCalledWith("name", "right");
  });

  it("visually indicates pinned columns", () => {
    const pinnedProps = {
      ...defaultProps,
      pinnedColumns: { left: ["name"], right: ["role"] },
    };

    render(<TableHeader {...pinnedProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const pinLeftButtons = screen.getAllByLabelText(/Pin column .* to left/);
    const pinRightButtons = screen.getAllByLabelText(/Pin column .* to right/);

    expect(pinLeftButtons[0]).toHaveClass("text-primary-500");
    expect(pinRightButtons[2]).toHaveClass("text-primary-500");
  });

  it("calls setColumnVisibility when visibility switch is toggled", () => {
    render(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const switches = document.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(switches[0]);

    expect(defaultProps.setColumnVisibility).toHaveBeenCalled();
  });

  it("handles column drag and drop operations", () => {
    render(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const columnItems = document.querySelectorAll('[draggable="true"]');

    fireEvent.dragStart(columnItems[0]);
    expect(defaultProps.handleDragStart).toHaveBeenCalledWith(
      expect.anything(),
      "name",
    );

    fireEvent.dragOver(columnItems[1]);
    expect(defaultProps.handleDragOver).toHaveBeenCalled();

    fireEvent.drop(columnItems[1]);
    expect(defaultProps.handleDrop).toHaveBeenCalledWith(
      expect.anything(),
      "email",
    );
  });

  it("renders columns in the specified order", () => {
    const reorderedProps = {
      ...defaultProps,
      columnOrder: ["role", "name", "email"],
    };

    render(<TableHeader {...reorderedProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const columnLabels = screen.getAllByText(/Jméno|Email|Role/);
    expect(columnLabels[0].textContent).toBe("Role");
    expect(columnLabels[1].textContent).toBe("Jméno");
    expect(columnLabels[2].textContent).toBe("Email");
  });
});
