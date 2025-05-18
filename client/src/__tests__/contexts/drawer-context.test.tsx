import { DrawerProvider } from "../../contexts/drawer-context";
import { fireEvent, render, screen } from "@testing-library/react";
import { mockLocalStorage } from "../setup";
import { use } from "react";
import DrawerContext from "../../contexts/drawer-context";

const useIsMobileMock = vi.hoisted(() => vi.fn(() => false));

vi.mock("../../hooks/use-is-mobile", () => ({
  default: useIsMobileMock,
}));

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

function TestComponent() {
  const { isCollapsed, isOpen, toggleCollapsed, toggleOpen } =
    use(DrawerContext);

  return (
    <div>
      <span data-testid="collapsed-state">{isCollapsed.toString()}</span>
      <span data-testid="open-state">{isOpen.toString()}</span>
      <button data-testid="toggle-collapsed" onClick={toggleCollapsed}>
        Toggle Collapsed
      </button>
      <button data-testid="toggle-open" onClick={toggleOpen}>
        Toggle Open
      </button>
    </div>
  );
}

describe("DrawerContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it("renders children correctly", () => {
    render(
      <DrawerProvider>
        <div data-testid="test-child">Test Child</div>
      </DrawerProvider>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("initializes with default values on desktop", () => {
    useIsMobileMock.mockReturnValue(false);

    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
    expect(screen.getByTestId("open-state")).toHaveTextContent("true");
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith("drawer-collapsed");
  });

  it("initializes with default values on mobile", () => {
    useIsMobileMock.mockReturnValue(true);

    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
    expect(screen.getByTestId("open-state")).toHaveTextContent("false");
  });

  it("loads collapsed state from localStorage on desktop", () => {
    useIsMobileMock.mockReturnValue(false);
    mockLocalStorage.setItem("drawer-collapsed", "true");

    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("true");
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith("drawer-collapsed");
  });

  it("toggles collapsed state and updates localStorage", () => {
    useIsMobileMock.mockReturnValue(false);

    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    const toggleButton = screen.getByTestId("toggle-collapsed");

    fireEvent.click(toggleButton);

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("true");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "drawer-collapsed",
      "true",
    );

    fireEvent.click(toggleButton);

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "drawer-collapsed",
      "false",
    );
  });

  it("toggles open state", () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    const toggleButton = screen.getByTestId("toggle-open");

    fireEvent.click(toggleButton);

    expect(screen.getByTestId("open-state")).toHaveTextContent("false");

    fireEvent.click(toggleButton);

    expect(screen.getByTestId("open-state")).toHaveTextContent("true");
  });

  it("updates states when device changes to mobile", () => {
    useIsMobileMock.mockReturnValue(false);

    const { rerender } = render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    expect(screen.getByTestId("open-state")).toHaveTextContent("true");

    useIsMobileMock.mockReturnValue(true);

    rerender(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
    expect(screen.getByTestId("open-state")).toHaveTextContent("false");
  });

  it("updates states when device changes to desktop", () => {
    useIsMobileMock.mockReturnValue(true);

    const { rerender } = render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    expect(screen.getByTestId("open-state")).toHaveTextContent("false");

    useIsMobileMock.mockReturnValue(false);

    rerender(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    expect(screen.getByTestId("open-state")).toHaveTextContent("true");
  });
});
