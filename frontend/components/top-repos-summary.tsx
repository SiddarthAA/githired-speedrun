"use client";
import { useEffect, useState } from "react";
import { fetchRepos, fetchAnalysis, type Analysis } from "@/lib/api";
import { AnalysisSummaryCard } from "./analysis-summary-card";

export function TopReposSummary() {
  const [analyses, setAnalyses] = useState<(Analysis | null)[]>([null, null, null]);
  const [loadingStates, setLoadingStates] = useState([true, true, true]);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    fetchRepos(10)
      .then((repos) => {
        const top3 = repos.slice(0, 3);
        setBootstrapped(true);

        // Mark extra slots as done if fewer than 3 repos
        if (top3.length < 3) {
          setLoadingStates((prev) => {
            const next = [...prev];
            for (let i = top3.length; i < 3; i++) next[i] = false;
            return next;
          });
        }

        top3.forEach((repo, i) => {
          const [owner, name] = repo.full_name.split("/");
          fetchAnalysis(owner, name)
            .then((analysis) =>
              setAnalyses((prev) => {
                const next = [...prev];
                next[i] = analysis;
                return next;
              })
            )
            .catch(() => {
              /* leave null — card shows unavailable state */
            })
            .finally(() =>
              setLoadingStates((prev) => {
                const next = [...prev];
                next[i] = false;
                return next;
              })
            );
        });
      })
      .catch(() => {
        setLoadingStates([false, false, false]);
        setBootstrapped(true);
      });
  }, []);

  // Don't render until we know how many repos exist
  if (!bootstrapped && loadingStates.every(Boolean)) {
    // Show skeleton section while waiting for the initial repo list
    return (
      <section className="mb-12">
        <div className="mb-6">
          <div className="h-5 w-48 bg-muted rounded animate-pulse mb-1" />
          <div className="h-3 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <AnalysisSummaryCard key={i} analysis={null} loading={true} />
          ))}
        </div>
      </section>
    );
  }

  const hasContent = analyses.some(Boolean) || loadingStates.some(Boolean);
  if (!hasContent) return null;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Top Repos at a Glance</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Auto-analysis of your 3 most-starred repositories
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <AnalysisSummaryCard
            key={i}
            analysis={analyses[i]}
            loading={loadingStates[i]}
          />
        ))}
      </div>
    </section>
  );
}
