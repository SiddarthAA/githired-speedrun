"use client";
import { useEffect, useState } from "react";
import { fetchAnalysis, type Analysis } from "@/lib/api";
import { ScoreRadial } from "@/components/score-radial";
import { CommitChart } from "@/components/commit-chart";
import { AiSummary } from "@/components/ai-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnalyzePage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis(owner, repo)
      .then(setData)
      .catch(() => setError("Analysis failed. The backend may be unavailable or the repository could not be accessed."))
      .finally(() => setLoading(false));
  }, [owner, repo]);

  if (loading) return <AnalysisSkeleton />;
  if (error)
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  if (!data) return null;

  const langTotal = Object.values(data.languages).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-muted-foreground">{owner} /</span>
          <span className="text-sm font-medium">{repo}</span>
          <Badge variant="outline" className="text-xs ml-auto">
            Grade {data.score.grade}
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* AI Summary */}
        <AiSummary text={data.ai_summary} score={data.score.overall} />

        <Separator />

        {/* Score breakdown */}
        <section>
          <h3 className="text-sm font-medium mb-6">Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Commit Health", value: data.score.commit_health },
              { label: "Documentation", value: data.score.documentation },
              { label: "Community", value: data.score.community },
              { label: "Activity", value: data.score.activity },
            ].map(({ label, value }) => (
              <ScoreRadial key={label} label={label} value={value} />
            ))}
          </div>
        </section>

        <Separator />

        {/* Commit chart */}
        <section>
          <h3 className="text-sm font-medium mb-4">
            Commit Frequency (last 16 weeks)
          </h3>
          <CommitChart data={data.commit_weekly} />
        </section>

        <Separator />

        {/* Languages */}
        <section>
          <h3 className="text-sm font-medium mb-4">Languages</h3>
          <div className="space-y-2">
            {Object.entries(data.languages)
              .sort(([, a], [, b]) => b - a)
              .map(([lang, bytes]) => (
                <div key={lang} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-muted-foreground text-xs">
                    {lang}
                  </span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/60 rounded-full"
                      style={{ width: `${(bytes / langTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {Math.round((bytes / langTotal) * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </section>

        <Separator />

        {/* Contributors */}
        <section>
          <h3 className="text-sm font-medium mb-4">Top Contributors</h3>
          <div className="flex flex-wrap gap-2">
            {data.contributors.map((c) => (
              <div
                key={c.login}
                className="flex items-center gap-2 border rounded-full px-3 py-1"
              >
                <img
                  src={`https://avatars.githubusercontent.com/${c.login}?s=24`}
                  className="w-4 h-4 rounded-full"
                  alt={c.login}
                />
                <span className="text-xs">{c.login}</span>
                <span className="text-xs text-muted-foreground">
                  {c.contributions}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
