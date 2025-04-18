import { Alert, Button, Input, Panel } from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { Link, useNavigate } from "react-router";
import { use, useActionState } from "react";
import logger from "../../utils/logger";
import SessionContext from "../../contexts/session-context";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const dict = getDictionary();

  const { forgotPassword } = use(SessionContext);

  const formState = async (_prevState: unknown, formData: FormData) => {
    try {
      const email = formData.get("email") as string;

      const error = await forgotPassword(email);

      if (error) return error;

      alert(dict.auth.forgotPassword.success);

      navigate("/");
    } catch (error) {
      logger.error(error);
    }
  };

  const [error, formAction, pending] = useActionState(formState, null);

  return (
    <div className="container mx-auto my-8 max-w-md p-6">
      <Panel
        title={dict.auth.forgotPassword.title}
        subtitle={dict.auth.forgotPassword.subtitle}
      >
        <form action={formAction} className="space-y-4">
          <Alert className="mb-6" type="danger">
            {error?.message}
          </Alert>

          <Input
            autoComplete="email"
            error={error?.fieldErrors?.email}
            label={dict.auth.forgotPassword.email}
            name="email"
            placeholder="example@email.com"
            required
            type="email"
          />

          <Button className="mt-2 w-full" loading={pending} type="submit">
            {dict.auth.forgotPassword.submit}
          </Button>

          <div className="text-center text-sm">
            {dict.auth.forgotPassword.backTo}{" "}
            <Link className="link underline" to="/login">
              {dict.auth.forgotPassword.login}
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
