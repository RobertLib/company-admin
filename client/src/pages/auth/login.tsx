import { Alert, Button, Input, Panel } from "../../components/ui";
import { AppError } from "../../types";
import { getDictionary } from "../../dictionaries";
import { Link, useNavigate } from "react-router";
import { use, useActionState, useState } from "react";
import logger from "../../utils/logger";
import SessionContext from "../../contexts/session-context";

export default function LoginPage() {
  const navigate = useNavigate();

  const dict = getDictionary();

  const { login } = use(SessionContext);

  const [errors, setErrors] = useState<AppError | null>(null);

  const formState = async (_prevState: unknown, formData: FormData) => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const responseError = await login(email, password);

      if (responseError) {
        setErrors(responseError);
        return responseError;
      }

      navigate("/");
    } catch (error) {
      logger.error(error);
    }
  };

  const [, formAction, pending] = useActionState(formState, null);

  return (
    <div className="container mx-auto my-8 max-w-md p-6">
      <Panel title={dict.auth.login.title} subtitle={dict.auth.login.subtitle}>
        <form
          action={formAction}
          className="space-y-4"
          onSubmit={() => {
            setErrors(null);
          }}
        >
          <Alert className="mb-6" type="danger">
            {errors?.message}
          </Alert>

          <Input
            autoComplete="email"
            error={errors?.fieldErrors?.email}
            label={dict.auth.login.email}
            name="email"
            placeholder="example@email.com"
            required
            type="email"
          />

          <div className="-mb-5.5 text-right">
            <Link
              className="link relative text-sm hover:underline"
              to="/forgot-password"
            >
              {dict.auth.login.forgotPassword}
            </Link>
          </div>

          <Input
            autoComplete="current-password"
            error={errors?.fieldErrors?.password}
            label={dict.auth.login.password}
            name="password"
            required
            type="password"
          />

          <Button className="mt-2 w-full" loading={pending} type="submit">
            {dict.auth.login.submit}
          </Button>

          <div className="text-center text-sm">
            {dict.auth.login.noAccount}{" "}
            <Link className="link underline" to="/register">
              {dict.auth.login.register}
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
