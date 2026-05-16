import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { env } from "@/lib/env";
import {
  createGitHubApp,
  type GitHubAppClient,
} from "@/lib/github-app";
import { parseFrontmatter } from "@/lib/profile-editor";
import { ProfileEditor } from "@/app/components/ProfileEditor";

export const dynamic = "force-dynamic";

function buildClient(): GitHubAppClient {
  return createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });
}

export default async function MeEditPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.githubHandle) {
    redirect("/login");
  }

  const member = findMemberByHandle(session.githubHandle);
  if (!member) {
    redirect("/no-access");
  }

  const path = `community/members/${member.slug}.md`;
  const file = await buildClient().readFile(path);
  if (!file) {
    redirect("/consent");
  }

  const { body } = parseFrontmatter(file.content);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">Edit profile</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Your changes commit to{" "}
        <code className="font-mono text-xs">{path}</code> as{" "}
        <code className="font-mono text-xs">warsaw-ai-bot</code> with you in
        the <code className="font-mono text-xs">Co-Authored-By</code> trailer.
      </p>
      <ProfileEditor
        initialBody={body.trim()}
        slug={member.slug}
        previewEndpoint="/api/preview-markdown"
      />
    </main>
  );
}
