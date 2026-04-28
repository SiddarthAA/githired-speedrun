import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default async function Home() {
  const session = await getServerSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-3 max-w-md">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground border rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Personal use · 3–5 users
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          GitHub Analyzer
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Connect your GitHub account and get AI-powered insights on code
          quality, commit patterns, and repository health.
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/dashboard" });
        }}
      >
        <Button size="lg" className="gap-2">
          <GithubIcon className="w-4 h-4" />
          Continue with GitHub
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Only reads public repo metadata. No code is stored.
      </p>
    </main>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
