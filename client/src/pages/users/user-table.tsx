import { Edit, Search, Trash } from "lucide-react";
import { getDictionary } from "../../dictionaries";
import { getTableParams } from "../../components/ui/data-table/table-params";
import {
  Chip,
  DataTable,
  IconButton,
  Switch,
  Tooltip,
} from "../../components/ui";
import { Link, useSearchParams } from "react-router";
import { use } from "react";
import { User } from "../../types/user";
import SnackbarContext from "../../contexts/snackbar-context";
import useQuery from "../../hooks/use-query";

export default function UserTable() {
  const dict = getDictionary();

  const { enqueueSnackbar } = use(SnackbarContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const showDeleted = searchParams.get("showDeleted") === "true";

  const { filters, limit, page, sortKey, sortOrder } =
    getTableParams(searchParams);

  const { data: users, isLoading } = useQuery<User[]>("users");

  return (
    <DataTable
      actions={(row) => (
        <div className="flex gap-2">
          <Tooltip title={dict.actions.detail}>
            <Link
              aria-label="Detail"
              className="icon-btn"
              to={`/users/${row.id}`}
            >
              <Search size={18} />
            </Link>
          </Tooltip>

          <Tooltip title={dict.actions.edit}>
            <Link
              aria-label="Edit"
              className="icon-btn"
              to={`/users?${new URLSearchParams(
                Object.fromEntries([
                  ...searchParams.entries(),
                  ["dialog", "userForm"],
                  ["dialogData", row.id],
                ]),
              )}`}
            >
              <Edit size={18} />
            </Link>
          </Tooltip>

          <Tooltip title={dict.actions.delete}>
            <IconButton
              aria-label="Delete"
              onClick={async () => {
                if (confirm(dict.actions.deleteConfirm)) {
                  const error = true;
                  enqueueSnackbar(
                    dict.actions[`delete${error ? "Error" : "Success"}`],
                  );
                }
              }}
            >
              <Trash size={18} />
            </IconButton>
          </Tooltip>
        </div>
      )}
      columns={[
        {
          filter: "input",
          key: "name",
          label: dict.user.name,
          sortable: true,
        },
        {
          filter: "input",
          key: "email",
          label: dict.user.email,
          sortable: true,
        },
        {
          filter: "select",
          filterSelectOptions: Object.entries({
            Admin: "ADMIN",
            User: "USER",
          }).map(([label, value]) => ({
            label,
            value,
          })),
          key: "role",
          label: dict.user.role,
          render: (row) => <Chip>{row.role}</Chip>,
        },
      ]}
      data={users ?? []}
      loading={isLoading}
      tableId="admin-users"
      toolbar={
        <Switch
          defaultChecked={showDeleted}
          label={dict.actions.showDeleted}
          onChange={() => {
            setSearchParams((prev) => {
              prev.set("showDeleted", showDeleted ? "false" : "true");
              prev.set("page", "1");
              return prev;
            });
          }}
        />
      }
      total={users?.length}
    />
  );
}
