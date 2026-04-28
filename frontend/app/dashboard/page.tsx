import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RepoGrid } from "@/components/repo-grid";
import { TopReposSummary } from "@/components/top-repos-summary";

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
        <TopReposSummary />
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-1">
            All Repositories
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Top repositories by stars. Click any to run a full analysis.
          </p>
          <RepoGrid />
        </div>
      </main>
    </div>
  );
}
