import "@testing-library/jest-dom";
import { LinkProps } from "react-router";

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useId: () => "test-id",
  };
});

vi.mock("react-router", () => ({
  Link: ({ children, to, ...rest }: LinkProps) => (
    <a href={to.toString()} {...rest}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
