import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { env } from "@/lib/env";

export const authConfig = {
  providers: [
    GitHub({
      clientId: env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: env.GITHUB_OAUTH_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: env.NEXTAUTH_SESSION_MAX_AGE,
  },
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, profile, account }) {
      if (
        account?.provider === "github" &&
        profile &&
        typeof (profile as { login?: unknown }).login === "string"
      ) {
        token.githubHandle = (
          profile as { login: string }
        ).login.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      // The Session.githubHandle augmentation below makes this a typed property.
      // If you need to drop the augmentation, this assignment will fail to
      // compile — that's the intended signal, not a regression.
      if (typeof token.githubHandle === "string") {
        session.githubHandle = token.githubHandle;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

declare module "next-auth" {
  interface Session {
    githubHandle?: string;
  }
}

// JWT interface augmentation lives in @auth/core/jwt which is an indirect dep
// (not hoisted by pnpm).  Extending the token is safe without augmentation
// because JWT already extends Record<string, unknown>.
