import { type NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Exchange GitHub access token for our backend JWT on first sign-in
      if (account?.access_token) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/github/callback?token=${account.access_token}`
          );
          if (res.ok) {
            const data = await res.json();
            token.backendJwt = data.access_token;
            token.githubLogin = data.user.login;
          }
        } catch {
          // backend unreachable during dev — token stays empty
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.backendJwt = token.backendJwt as string;
      session.githubLogin = token.githubLogin as string;
      return session;
    },
  },
};
