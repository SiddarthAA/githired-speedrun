"use client";
import { useEffect, useState } from "react";
import { fetchRepos, type Repo } from "@/lib/api";
import { RepoCard } from "./repo-card";
import { Skeleton } from "@/components/ui/skeleton";

export function RepoGrid() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepos(10)
      .then(setRepos)
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {repos.map((repo) => (
        <RepoCard key={repo.full_name} repo={repo} />
      ))}
    </div>
  );
}
