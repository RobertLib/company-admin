import { Alert, Button, Input, Panel } from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { Link, useNavigate, useSearchParams } from "react-router";
import { use, useActionState } from "react";
import logger from "../../utils/logger";
import SessionContext from "../../contexts/session-context";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const dict = getDictionary();

  const { resetPassword } = use(SessionContext);

  const formState = async (_prevState: unknown, formData: FormData) => {
    try {
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      const error = await resetPassword(password, confirmPassword, token);

      if (error) return error;

      alert(dict.auth.resetPassword.success);

      navigate("/");
    } catch (error) {
      logger.error(error);
    }
  };

  const [error, formAction, pending] = useActionState(formState, null);

  return (
    <div className="container mx-auto my-8 max-w-md p-6">
      <Panel
        title={dict.auth.resetPassword.title}
        subtitle={dict.auth.resetPassword.subtitle}
      >
        <form action={formAction} className="space-y-4">
          <Alert className="mb-6" type="danger">
            {error?.message}
          </Alert>

          <Input
            autoComplete="new-password"
            error={error?.fieldErrors?.password}
            label={dict.auth.resetPassword.password}
            name="password"
            required
            type="password"
          />

          <Input
            autoComplete="new-password"
            error={error?.fieldErrors?.confirmPassword}
            label={dict.auth.resetPassword.confirmPassword}
            name="confirmPassword"
            required
            type="password"
          />

          <Button className="mt-2 w-full" loading={pending} type="submit">
            {dict.auth.resetPassword.submit}
          </Button>

          <div className="text-center text-sm">
            {dict.auth.resetPassword.backTo}{" "}
            <Link className="link underline" to="/login">
              {dict.auth.resetPassword.login}
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
