import { Breadcrumbs, Header } from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { Link, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import UserTable from "./user-table";

export default function UsersPage() {
  const [searchParams] = useSearchParams();

  const dict = getDictionary();

  return (
    <div className="container mx-auto p-4">
      <Breadcrumbs
        className="mb-2"
        items={[{ href: "/users", label: dict.users.title }]}
      />

      <Header
        actions={
          <Link
            className="btn"
            to={`/users?${new URLSearchParams(
              Object.fromEntries([
                ...searchParams.entries(),
                ["dialog", "userForm"],
              ]),
            )}`}
          >
            <Plus size={18} />
            {dict.actions.new}
          </Link>
        }
        className="mb-3"
        title={dict.users.title}
      />

      <UserTable />
    </div>
  );
}
