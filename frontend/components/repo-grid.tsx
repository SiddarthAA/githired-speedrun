"use client";
import { useEffect, useState } from "react";
import { fetchRepos, type Repo } from "@/lib/api";
import { RepoCard } from "./repo-card";
import { Skeleton } from "@/components/ui/skeleton";

export function RepoGrid() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepos(10)
      .then(setRepos)
      .catch(() => setError("Failed to load repositories. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No repositories found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {repos.map((repo) => (
        <RepoCard key={repo.full_name} repo={repo} />
      ))}
    </div>
  );
}
