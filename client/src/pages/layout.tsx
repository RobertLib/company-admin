import { Calendar, SquareDashed, Users } from "lucide-react";
import { Drawer, Navbar } from "../components/ui";
import { getDictionary } from "../dictionaries";
import { Outlet } from "react-router";
import ErrorBoundary from "../error-boundary";

export default function Layout() {
  const dict = getDictionary();

  return (
    <>
      <Drawer
        items={[
          {
            href: "/users",
            icon: <Users size={18} />,
            label: dict.users.title,
          },
          {
            href: "/calendar",
            icon: <Calendar size={18} />,
            label: dict.calendar.title,
          },
          {
            href: "/test",
            icon: <SquareDashed size={18} />,
            label: "test",
            children: [
              {
                href: "/test/1",
                icon: <SquareDashed size={18} />,
                label: "test 1",
              },
              {
                href: "/test/2",
                icon: <SquareDashed size={18} />,
                label: "test 2",
              },
            ],
          },
        ]}
      />
      <Navbar />
      <main>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </>
  );
}
