import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginButton } from "@/components/login-button";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-3 max-w-md">
        <h1 className="text-4xl font-semibold tracking-tight">
          GitHub Analyzer
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Connect your GitHub account and get AI-powered insights on code
          quality, commit patterns, and repository health.
        </p>
      </div>

      <LoginButton />

      <p className="text-xs text-muted-foreground">
        Only reads public repo metadata. No code is stored.
      </p>
    </main>
  );
}

