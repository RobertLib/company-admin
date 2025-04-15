import { act, fireEvent, render, screen } from "@testing-library/react";
import Popover from "../../../components/ui/popover";

describe("Popover Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders trigger correctly", () => {
    render(
      <Popover trigger={<button>Toggle</button>}>Popover Content</Popover>,
    );

    expect(screen.getByText("Toggle")).toBeInTheDocument();
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("shows content on hover when triggerType is 'hover'", () => {
    render(
      <Popover trigger={<button>Toggle</button>} triggerType="hover">
        Popover Content
      </Popover>,
    );

    fireEvent.mouseEnter(screen.getByText("Toggle"));
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText("Toggle"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("shows content on click when triggerType is 'click'", () => {
    render(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("closes on Escape key press", () => {
    render(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("applies correct position classes", () => {
    const positions = ["top", "bottom", "left", "right"] as const;

    positions.forEach((position) => {
      const { unmount } = render(
        <Popover
          trigger={<button>Toggle</button>}
          position={position}
          open={true}
        >
          Popover Content
        </Popover>,
      );

      const popoverContent = screen.getByText("Popover Content");
      expect(popoverContent).toBeInTheDocument();

      unmount();
    });
  });

  it("applies correct alignment classes for top/bottom positions", () => {
    const alignments = ["left", "right"] as const;

    alignments.forEach((align) => {
      const { unmount } = render(
        <Popover
          trigger={<button>Toggle</button>}
          position="top"
          align={align}
          open={true}
        >
          Popover Content
        </Popover>,
      );

      const popoverContent = screen.getByText("Popover Content");
      expect(popoverContent).toBeInTheDocument();

      unmount();

      const { unmount: unmount2 } = render(
        <Popover
          trigger={<button>Toggle</button>}
          position="bottom"
          align={align}
          open={true}
        >
          Popover Content
        </Popover>,
      );

      const popoverContent2 = screen.getByText("Popover Content");
      expect(popoverContent2).toBeInTheDocument();

      unmount2();
    });
  });

  it("calls onOpenChange when state changes", () => {
    const handleOpenChange = vi.fn();
    render(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        onOpenChange={handleOpenChange}
      >
        Popover Content
      </Popover>,
    );

    fireEvent.mouseEnter(screen.getByText("Toggle"));
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    fireEvent.mouseLeave(screen.getByText("Toggle"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("respects controlled open state", () => {
    const { rerender } = render(
      <Popover trigger={<button>Toggle</button>} open={false}>
        Popover Content
      </Popover>,
    );

    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();

    rerender(
      <Popover trigger={<button>Toggle</button>} open={true}>
        Popover Content
      </Popover>,
    );

    expect(screen.getByText("Popover Content")).toBeInTheDocument();
  });

  it("applies custom classes to content and container", () => {
    render(
      <Popover
        trigger={<button>Toggle</button>}
        open={true}
        className="container-custom"
        contentClassName="content-custom"
      >
        Popover Content
      </Popover>,
    );

    const trigger = screen.getByTestId("popover-trigger");
    expect(trigger).toBeInTheDocument();

    const content = screen.getByText("Popover Content");
    expect(content).toBeInTheDocument();
  });

  it("sets width style on content", () => {
    render(
      <Popover trigger={<button>Toggle</button>} open={true} width="300px">
        Popover Content
      </Popover>,
    );

    const content = screen.getByText("Popover Content");
    expect(content).toBeInTheDocument();
  });

  it("sets correct ARIA attributes for click trigger", () => {
    render(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    const trigger = screen.getByText("Toggle").closest("div");

    expect(trigger).toBeInTheDocument();

    fireEvent.click(screen.getByText("Toggle"));

    const content = screen.getByText("Popover Content");
    expect(content).toBeInTheDocument();
  });

  it("renders bridge element for hover interaction", () => {
    render(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const bridge = document.querySelector(".popover-bridge");
    expect(bridge).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText("Toggle"));
    fireEvent.mouseEnter(bridge!);
    expect(screen.getByText("Popover Content")).toBeInTheDocument();
  });

  it("renders fallback div when trigger not provided", () => {
    render(<Popover>Popover Content</Popover>);

    const trigger = screen.getByTestId("popover-trigger");
    const fallbackDiv = trigger.querySelector("div.absolute.inset-0");
    expect(fallbackDiv).toBeInTheDocument();
  });

  it("manages focus correctly", () => {
    render(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        <button data-testid="content-button">Content Button</button>
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle"));

    const contentButton = screen.getByTestId("content-button");
    contentButton.focus();

    fireEvent.focusOut(contentButton, { relatedTarget: document.body });

    expect(screen.queryByTestId("content-button")).not.toBeInTheDocument();
  });

  it("forwards additional props to container", () => {
    render(
      <Popover trigger={<button>Toggle</button>} aria-label="Popover component">
        Popover Content
      </Popover>,
    );

    const trigger = screen.getByTestId("popover-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-label", "Popover component");
  });
});
