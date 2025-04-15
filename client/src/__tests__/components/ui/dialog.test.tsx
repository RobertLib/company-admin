import { act, fireEvent, render, screen } from "@testing-library/react";
import Dialog from "../../../components/ui/dialog";

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

HTMLDialogElement.prototype.showModal = vi.fn();

describe("Dialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders dialog with content", () => {
    const { container } = render(
      <Dialog>
        <p>Dialog content</p>
      </Dialog>,
    );

    const dialog = container.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it("renders title when provided", () => {
    const { container } = render(<Dialog title="Test Dialog">Content</Dialog>);

    const titleElement = container.querySelector("h2");
    expect(titleElement).toHaveTextContent("Test Dialog");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Dialog className="custom-class">Content</Dialog>,
    );

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveClass("custom-class");
    expect(dialog).toHaveClass("m-auto", "rounded-md", "border");
  });

  it("calls navigate(-1) when close button is clicked", async () => {
    const { container } = render(<Dialog title="Test Dialog">Content</Dialog>);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const closeButton = container.querySelector(
      "button[aria-label='Close dialog']",
    )!;
    fireEvent.click(closeButton);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("closes dialog when clicking outside", async () => {
    const { container } = render(<Dialog title="Test Dialog">Content</Dialog>);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const dialog = container.querySelector("dialog")!;
    fireEvent.mouseDown(dialog);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("closes dialog on Escape key", () => {
    render(<Dialog title="Test Dialog">Content</Dialog>);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("manages focus trap behavior", () => {
    const { container } = render(
      <Dialog title="Test Dialog">
        <button>First Button</button>
        <button>Second Button</button>
      </Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    const firstContentButton = buttons.find(
      (btn) => btn.textContent === "First Button",
    )!;
    const secondContentButton = buttons.find(
      (btn) => btn.textContent === "Second Button",
    )!;
    const closeButton = container.querySelector(
      "button[aria-label='Close dialog']",
    ) as HTMLButtonElement;

    expect(firstContentButton).toBeInTheDocument();
    expect(secondContentButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();

    firstContentButton.focus();
    expect(document.activeElement).toBe(firstContentButton);

    secondContentButton.focus();
    expect(document.activeElement).toBe(secondContentButton);

    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);
  });

  it("passes additional props to dialog element", () => {
    const { container } = render(
      <Dialog data-testid="test-dialog" title="Test Dialog">
        Content
      </Dialog>,
    );

    const dialog = container.querySelector("dialog");
    expect(dialog).toHaveAttribute("data-testid", "test-dialog");
  });
});
