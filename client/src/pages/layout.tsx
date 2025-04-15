import { Drawer, Navbar } from "../components/ui";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <Drawer items={[]} />
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
