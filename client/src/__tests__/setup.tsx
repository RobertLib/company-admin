import "@testing-library/jest-dom";
import { LinkProps } from "react-router";
import { vi } from "vitest";

vi.mock("react-router", () => ({
  Link: ({ children, to, ...rest }: LinkProps) => (
    <a href={to.toString()} {...rest}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useSearchParams: () => [{}, vi.fn()],
}));
