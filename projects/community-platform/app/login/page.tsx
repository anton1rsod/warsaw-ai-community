import { env } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-3xl font-semibold">{env.COMMUNITY_NAME}</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Members-only platform. Sign in with the GitHub account associated with
        your roster entry.
      </p>
      <LoginForm />
    </main>
  );
}
