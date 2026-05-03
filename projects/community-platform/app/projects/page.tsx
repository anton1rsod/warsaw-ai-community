import Link from "next/link";
import { listProjectDetails } from "@/lib/content-snapshot";

export default function ProjectsPage(): React.JSX.Element {
  const projects = listProjectDetails();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <Link href="/home" className="text-sm underline">
          Home
        </Link>
      </header>
      <ul className="mt-6 grid gap-3">
        {projects.map((p) => (
          <li
            key={p.slug}
            className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Link href={`/projects/${p.slug}`} className="block">
              <div className="font-medium">{p.title}</div>
              <div className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
                {p.slug}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
