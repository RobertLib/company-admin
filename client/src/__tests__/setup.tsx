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
  useSearchParams: () => [{}, vi.fn()],
}));
