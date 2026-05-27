import { env } from "@/lib/env";
import { s } from "@/lib/i18n/strings";
import { MonoLabel } from "@/app/components/MonoLabel";
import { LoginForm } from "./LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <MonoLabel>{s("login.kicker")}</MonoLabel>
          <h1 className="font-display font-semibold text-3xl text-ink">
            {env.COMMUNITY_NAME}
          </h1>
          <p className="font-body text-dust">
            {s("login.description")}
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
