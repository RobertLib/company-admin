import { Drawer, Navbar } from "../components/ui";
import { getDictionary } from "../dictionaries";
import { Outlet } from "react-router";
import { Users } from "lucide-react";

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
        ]}
      />
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
