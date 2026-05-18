import { headers } from "next/headers";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

/**
 * Root shell composer — Q3.1 / D30.
 *
 * Reads the current pathname from request headers (Next.js 16 server-side
 * scope) and decides which shell variant to render:
 *
 *   /login                                  → no header, no footer
 *   /no-access | /consent                   → compact header (auth-state only), footer
 *   *                                        → full header (5-nav + auth state), footer
 */
interface RootShellProps {
  children: React.ReactNode;
}

export async function RootShell({ children }: RootShellProps): Promise<React.JSX.Element> {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "/";

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const compact = pathname === "/no-access" || pathname === "/consent";

  return (
    <>
      <Header activePath={pathname} compact={compact} />
      {children}
      <Footer />
    </>
  );
}
