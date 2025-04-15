import { act, fireEvent, render, screen } from "@testing-library/react";
import Toast from "../../../components/ui/toast";

describe("Toast Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders correctly with required props", () => {
    render(<Toast message="Test message" />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    const { container } = render(<Toast message="Test message" />);
    const toast = container.firstChild;

    expect(toast).toHaveClass("rounded-md");
    expect(toast).toHaveClass("border");
    expect(toast).toHaveClass("p-4");
    expect(toast).toHaveClass("shadow-md");
  });

  it("applies variant-specific classes", () => {
    const variantTests = [
      { variant: "default", className: "border-secondary-200" },
      { variant: "success", className: "border-success-200" },
      { variant: "error", className: "border-danger-200" },
      { variant: "warning", className: "border-warning-200" },
      { variant: "info", className: "border-info-200" },
    ] as const;

    variantTests.forEach(({ variant, className }) => {
      const { container, unmount } = render(
        <Toast message="Test message" variant={variant} />,
      );
      const toast = container.firstChild;
      expect(toast).toHaveClass(className);
      unmount();
    });
  });

  it("combines custom className with default classes", () => {
    const { container } = render(
      <Toast message="Test message" className="custom-class" />,
    );
    const toast = container.firstChild;
    expect(toast).toHaveClass("custom-class");
    expect(toast).toHaveClass("rounded-md");
  });

  it("calls onClose after duration", () => {
    const onClose = vi.fn();
    render(<Toast message="Test message" onClose={onClose} duration={1000} />);

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Toast message="Test message" onClose={onClose} />,
    );
    const toast = container.firstChild;

    fireEvent.keyDown(toast as Element, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<Toast message="Test message" onClose={onClose} />);

    const closeButton = screen.getByLabelText("Close notification");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("doesn't show close button when onClose is not provided", () => {
    render(<Toast message="Test message" />);
    expect(
      screen.queryByLabelText("Close notification"),
    ).not.toBeInTheDocument();
  });

  it("sets correct aria attributes", () => {
    const { container, rerender } = render(<Toast message="Test message" />);
    let toast = container.firstChild;

    expect(toast).toHaveAttribute("role", "status");
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(toast).toHaveAttribute("aria-atomic", "true");
    expect(toast).toHaveAttribute("id", "test-id");
    expect(toast).toHaveAttribute("tabIndex", "0");

    rerender(<Toast message="Error message" variant="error" />);
    toast = container.firstChild;
    expect(toast).toHaveAttribute("aria-live", "assertive");
  });

  it("has initial visible animation class", () => {
    const { container } = render(<Toast message="Test message" />);
    const toast = container.firstChild;
    expect(toast).toHaveClass("animate-slide-up");
  });

  it("changes to slide-down animation when visibility changes", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Toast message="Test message" onClose={onClose} duration={1000} />,
    );

    const toast = container.firstChild;
    expect(toast).toHaveClass("animate-slide-up");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(toast).toHaveClass("animate-slide-down");
  });

  it("forwards additional props to div element", () => {
    render(
      <Toast
        message="Test message"
        data-testid="toast-test"
        aria-label="Notification"
      />,
    );

    const toast = screen.getByTestId("toast-test");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute("aria-label", "Notification");
  });
});
