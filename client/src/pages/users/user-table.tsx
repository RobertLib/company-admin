import { Edit, Search, Trash } from "lucide-react";
import { getDictionary } from "../../dictionaries";
import { getTableParams } from "../../components/ui/data-table/table-params";
import {
  Chip,
  DataTable,
  Dialog,
  IconButton,
  Switch,
  Tooltip,
} from "../../components/ui";
import { Link, useSearchParams } from "react-router";
import { use } from "react";
import { User } from "../../types";
import { USER_ROLES } from "../../enums";
import SnackbarContext from "../../contexts/snackbar-context";
import useMutation from "../../hooks/use-mutation";
import useQuery from "../../hooks/use-query";
import UserForm from "./user-form";

export default function UserTable() {
  const dict = getDictionary();

  const { enqueueSnackbar } = use(SnackbarContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, ...tableParams } = getTableParams(searchParams);

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery<{
    users: User[];
    totalCount: number;
  }>("/users", {
    params: {
      ...tableParams,
      name: filters.name,
      email: filters.email,
      role: filters.role,
    },
  });

  const { users, totalCount } = usersData ?? {};

  const { mutate: deleteUser, isPendingId } = useMutation(
    (id) => `/users/${id}`,
    {
      method: "DELETE",
      onError: (error) => {
        enqueueSnackbar(error.message, "error");
      },
      onSuccess: () => {
        enqueueSnackbar(dict.actions.deleteSuccess, "success");
      },
    },
  );

  return (
    <>
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
                loading={isPendingId(row.id)}
                onClick={async () => {
                  if (confirm(dict.actions.deleteConfirm)) {
                    await deleteUser(row.id);
                    refetch();
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
            filterSelectOptions: Object.entries(USER_ROLES).map(
              ([label, value]) => ({ label, value }),
            ),
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
            defaultChecked={tableParams.showDeleted}
            label={dict.actions.showDeleted}
            onChange={() => {
              setSearchParams((prev) => {
                prev.set(
                  "showDeleted",
                  tableParams.showDeleted ? "false" : "true",
                );
                prev.set("page", "1");
                return prev;
              });
            }}
          />
        }
        total={totalCount}
      />

      {searchParams.get("dialog") === "userForm" && !isLoading && (
        <Dialog title={dict.user.title}>
          <UserForm
            onSubmit={refetch}
            user={users?.find(
              ({ id }) => id === Number(searchParams.get("dialogData")),
            )}
          />
        </Dialog>
      )}
    </>
  );
}
