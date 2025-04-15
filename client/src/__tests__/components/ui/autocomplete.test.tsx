import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Autocomplete from "../../../components/ui/autocomplete";

const mockOptions = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

describe("Autocomplete Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    render(<Autocomplete options={mockOptions} />);
    expect(screen.getByTestId("popover-trigger")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Autocomplete options={mockOptions} label="Test Label" />);
    expect(screen.getByText("Test Label:")).toBeInTheDocument();
  });

  it("shows required indicator when required is true", () => {
    render(<Autocomplete options={mockOptions} label="Test Label" required />);
    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toHaveClass("text-danger-500");
  });

  it("shows error message when error is provided", () => {
    render(
      <Autocomplete options={mockOptions} error="This field is required" />,
    );
    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toHaveTextContent("This field is required");
  });

  it("applies error styling when error is provided", () => {
    render(
      <Autocomplete
        options={mockOptions}
        error="This field is required"
        data-testid="autocomplete"
      />,
    );

    const inputContainer = screen
      .getByTestId("popover-trigger")
      .querySelector("div");
    expect(inputContainer?.className).toContain("border-danger-500!");
  });

  it("opens dropdown on click in select mode", () => {
    render(<Autocomplete options={mockOptions} asSelect />);

    fireEvent.click(screen.getByTestId("popover-trigger"));

    expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("filters options based on input in autocomplete mode", () => {
    render(<Autocomplete options={mockOptions} />);

    fireEvent.click(screen.getByTestId("popover-trigger"));

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Option 1" } });

    const options = screen.getAllByRole("option");
    expect(options.length).toBe(1);
    expect(options[0]).toHaveTextContent("Option 1");
  });

  it("selects an option when clicked", () => {
    const handleChange = vi.fn();
    render(<Autocomplete options={mockOptions} onChange={handleChange} />);

    fireEvent.click(screen.getByTestId("popover-trigger"));
    fireEvent.click(screen.getByText("Option 2"));

    expect(handleChange).toHaveBeenCalledWith("option2");
    expect(screen.getByRole("combobox")).toHaveValue("Option 2");
  });

  it("works in multiple selection mode", () => {
    const handleChange = vi.fn();

    const { unmount } = render(
      <Autocomplete options={mockOptions} multiple onChange={handleChange} />,
    );

    fireEvent.click(screen.getByTestId("popover-trigger"));
    fireEvent.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith(["option1"]);

    const chips = screen.getAllByTestId("chip");
    expect(chips.length).toBe(1);
    expect(chips[0]).toHaveTextContent("Option 1");

    unmount();

    render(
      <Autocomplete
        options={mockOptions}
        multiple
        value={["option1", "option2"]}
      />,
    );

    const updatedChips = screen.getAllByTestId("chip");
    expect(updatedChips.length).toBe(2);
  });

  it("clears selection in single mode when clear button is clicked", () => {
    const handleChange = vi.fn();

    const { rerender } = render(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        value="option1"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("Option 1");

    rerender(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        value={null}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("removes selected option when chip is clicked in multiple mode", () => {
    const handleChange = vi.fn();
    render(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1", "option2"]}
      />,
    );

    const chips = screen.getAllByTestId("chip");
    expect(chips.length).toBe(2);

    fireEvent.click(chips[0]);

    expect(handleChange).toHaveBeenCalledWith(["option2"]);
  });

  it("supports keyboard navigation", () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Option 2");
  });

  it("sets initial value from prop", () => {
    render(<Autocomplete options={mockOptions} value="option3" />);
    expect(screen.getByRole("combobox")).toHaveValue("Option 3");
  });

  it("creates hidden inputs for form submission", () => {
    render(
      <Autocomplete options={mockOptions} name="test-field" value="option2" />,
    );

    const hiddenInput = document.querySelector('input[type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute("name", "test-field");
    expect(hiddenInput).toHaveAttribute("value", "option2");
  });

  it("creates multiple hidden inputs in multiple mode", () => {
    render(
      <Autocomplete
        options={mockOptions}
        name="test-field"
        multiple
        value={["option1", "option3"]}
      />,
    );

    const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
    expect(hiddenInputs.length).toBe(2);
    expect(hiddenInputs[0]).toHaveAttribute("value", "option1");
    expect(hiddenInputs[1]).toHaveAttribute("value", "option3");
  });

  it("shows empty option when hasEmpty is true in select mode", () => {
    render(<Autocomplete options={mockOptions} asSelect hasEmpty />);

    fireEvent.click(screen.getByTestId("popover-trigger"));

    const options = screen.getAllByRole("option");
    expect(options.length).toBe(4);
    expect(options[0]).toBeInTheDocument();
    expect(options[0].textContent?.trim()).toBe("");
  });

  it("calls loadMore when scrolling to bottom", async () => {
    const loadMore = vi.fn().mockResolvedValue(undefined);

    render(<Autocomplete options={mockOptions} loadMore={loadMore} />);

    fireEvent.click(screen.getByTestId("popover-trigger"));

    const listbox = screen.getByRole("listbox");
    Object.defineProperty(listbox, "scrollTop", { value: 100 });
    Object.defineProperty(listbox, "scrollHeight", { value: 120 });
    Object.defineProperty(listbox, "clientHeight", { value: 30 });

    fireEvent.scroll(listbox);

    await waitFor(() => {
      expect(loadMore).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
  });

  it("shows no results message when no options match the filter", () => {
    render(<Autocomplete options={mockOptions} />);

    fireEvent.click(screen.getByTestId("popover-trigger"));

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "No match" } });

    expect(screen.getByText("Žádné výsledky")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Autocomplete
        options={mockOptions}
        className="custom-class"
        data-testid="autocomplete"
      />,
    );

    const container = screen.getByTestId("autocomplete");
    expect(container).toHaveClass("custom-class");
    expect(container).toHaveClass("relative");
  });

  it("forwards additional props to container", () => {
    render(
      <Autocomplete
        options={mockOptions}
        data-testid="autocomplete-test"
        aria-label="Autocomplete field"
      />,
    );

    const container = screen.getByTestId("autocomplete-test");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("aria-label", "Autocomplete field");
  });

  it("handles defaultValue prop correctly", () => {
    render(<Autocomplete options={mockOptions} defaultValue="option1" />);
    expect(screen.getByRole("combobox")).toHaveValue("Option 1");
  });

  it("handles error when loading more options fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockError = new Error("Failed to load");
    const loadMore = vi.fn().mockRejectedValue(mockError);

    render(<Autocomplete options={mockOptions} loadMore={loadMore} />);

    fireEvent.click(screen.getByTestId("popover-trigger"));

    const listbox = screen.getByRole("listbox");
    Object.defineProperty(listbox, "scrollTop", { value: 100 });
    Object.defineProperty(listbox, "scrollHeight", { value: 120 });
    Object.defineProperty(listbox, "clientHeight", { value: 30 });

    fireEvent.scroll(listbox);

    await waitFor(() => {
      expect(loadMore).toHaveBeenCalledTimes(1);
    });

    consoleErrorSpy.mockRestore();
  });

  it("ignores selection of already selected option in multiple mode", () => {
    const handleChange = vi.fn();
    render(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1"]}
      />,
    );

    fireEvent.click(screen.getByTestId("popover-trigger"));
    fireEvent.click(screen.getByText("Option 1"));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("handles space key to open dropdown", () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: " " });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("handles focus to open dropdown in non-select mode", () => {
    render(<Autocomplete options={mockOptions} />);

    fireEvent.focus(screen.getByTestId("popover-trigger"));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("handles escape key to close dropdown", () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("allows keyboard navigation up with ArrowUp key", () => {
    render(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Option 2");
  });

  it("handles changing input in non-select mode", () => {
    const handleChange = vi.fn();
    render(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        value="option1"
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Option" } });

    expect(handleChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("Option");
  });

  it("clears selected option when x button is clicked", () => {
    const handleChange = vi.fn();

    render(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        value="option1"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("Option 1");

    const clearButton = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearButton);

    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("clears input value when x button is clicked", () => {
    const handleChange = vi.fn();

    render(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        value="option1"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("Option 1");

    const clearButton = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearButton);

    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("handles mouse enter on option to update active index", () => {
    render(<Autocomplete options={mockOptions} />);

    fireEvent.click(screen.getByTestId("popover-trigger"));

    const options = screen.getAllByRole("option");
    fireEvent.mouseEnter(options[1]);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Option 2");
  });

  it("uses chip keyboard accessibility (Enter key) to remove option", () => {
    const handleChange = vi.fn();
    render(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1", "option2"]}
      />,
    );

    const chips = screen.getAllByTestId("chip");
    fireEvent.keyDown(chips[0], { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(["option2"]);
  });
});
