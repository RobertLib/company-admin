import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="container mx-auto mt-8 p-6 text-center">
      <h1 className="mb-4 text-2xl font-bold">404 - Page not found</h1>
      <p className="mb-4">
        The requested page was not found or is no longer available.
      </p>
      <Link className="btn" to="/">
        Return to main page
      </Link>
    </div>
  );
}
