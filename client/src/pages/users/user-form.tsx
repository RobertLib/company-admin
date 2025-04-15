import { Alert, Autocomplete, Button, Input } from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { use } from "react";
import { useNavigate } from "react-router";
import { User } from "../../types";
import { USER_ROLES } from "../../enums";
import logger from "../../utils/logger";
import SnackbarContext from "../../contexts/snackbar-context";
import useMutation from "../../hooks/use-mutation";

export default function UserForm({
  onSubmit,
  user,
}: Readonly<{
  onSubmit?: () => void;
  user?: User;
}>) {
  const navigate = useNavigate();

  const dict = getDictionary();

  const { enqueueSnackbar } = use(SnackbarContext);

  const { error, isPending, mutate } = useMutation(
    user ? `/users/${user.id}` : "/users",
    {
      method: user ? "PATCH" : "POST",
      onSuccess: () => {
        enqueueSnackbar(
          dict.actions[`${user ? "update" : "create"}Success`],
          "success",
        );
      },
    },
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);

      const email = formData.get("email") as string;
      const name = formData.get("name") as string;
      const role = formData.get("role") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      await mutate({
        email,
        name,
        role,
        password,
        confirmPassword,
      });

      onSubmit?.();

      navigate(-1);
    } catch (error) {
      logger.error(error);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Alert className="mb-6" type="danger">
        {error?.message}
      </Alert>

      <Input
        autoComplete="email"
        defaultValue={user?.email}
        error={error?.fieldErrors?.email}
        label={dict.user.email}
        name="email"
        placeholder="example@email.com"
        required
        type="email"
      />

      <Input
        autoComplete="name"
        defaultValue={user?.name ?? ""}
        error={error?.fieldErrors?.name}
        label={dict.user.name}
        name="name"
      />

      <Autocomplete
        asSelect
        defaultValue={user?.role ?? USER_ROLES.User}
        error={error?.fieldErrors?.role}
        label={dict.user.role}
        name="role"
        options={Object.entries(USER_ROLES).map(([label, value]) => ({
          label,
          value,
        }))}
        required
      />

      <Input
        autoComplete="new-password"
        error={error?.fieldErrors?.password}
        label={dict.user.password}
        name="password"
        required={!user}
        type="password"
      />

      <Input
        autoComplete="new-password"
        error={error?.fieldErrors?.confirmPassword}
        label={dict.user.confirmPassword}
        name="confirmPassword"
        required={!user}
        type="password"
      />

      <Button className="mt-2 w-full" loading={isPending} type="submit">
        {dict.form.submit}
      </Button>
    </form>
  );
}
