import { Alert, Button, Input, Panel } from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { Link, useNavigate } from "react-router";
import { use, useActionState } from "react";
import logger from "../../utils/logger";
import SessionContext from "../../contexts/session-context";

export default function RegisterPage() {
  const navigate = useNavigate();

  const dict = getDictionary();

  const { register } = use(SessionContext);

  const formState = async (_prevState: unknown, formData: FormData) => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      const error = await register(email, password, confirmPassword);

      if (error) return error;

      navigate("/");
    } catch (error) {
      logger.error(error);
    }
  };

  const [error, formAction, pending] = useActionState(formState, null);

  return (
    <div className="container mx-auto my-8 max-w-md p-6">
      <Panel
        title={dict.auth.register.title}
        subtitle={dict.auth.register.subtitle}
      >
        <form action={formAction} className="space-y-4">
          <Alert className="mb-6" type="danger">
            {error?.message}
          </Alert>

          <Input
            autoComplete="email"
            error={error?.fieldErrors?.email}
            label={dict.auth.register.email}
            name="email"
            placeholder="example@email.com"
            required
            type="email"
          />

          <Input
            autoComplete="new-password"
            error={error?.fieldErrors?.password}
            label={dict.auth.register.password}
            name="password"
            required
            type="password"
          />

          <Input
            autoComplete="new-password"
            error={error?.fieldErrors?.confirmPassword}
            label={dict.auth.register.confirmPassword}
            name="confirmPassword"
            required
            type="password"
          />

          <Button className="mt-2 w-full" loading={pending} type="submit">
            {dict.auth.register.submit}
          </Button>

          <div className="text-center text-sm">
            {dict.auth.register.haveAccount}{" "}
            <Link className="link underline" to="/login">
              {dict.auth.register.login}
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
