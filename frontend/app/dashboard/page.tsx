import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RepoGrid } from "@/components/repo-grid";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-medium text-sm">GitHub Analyzer</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session.user?.name}
            </span>
            <img
              src={session.user?.image ?? ""}
              className="w-7 h-7 rounded-full"
              alt=""
            />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Your Repositories
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Top repositories by stars. Click to run analysis.
          </p>
        </div>
        <RepoGrid />
      </main>
    </div>
  );
}
