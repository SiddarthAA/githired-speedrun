"use client";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CommitChart } from "./commit-chart";
import { Sparkles, ArrowRight, GitCommitHorizontal, Loader2 } from "lucide-react";
import { type Analysis } from "@/lib/api";
import { getLangColor } from "@/lib/lang-colors";

function gradeColor(grade: string) {
  switch (grade) {
    case "A": return "bg-green-500/15 text-green-600 border-green-500/30";
    case "B": return "bg-blue-500/15 text-blue-600 border-blue-500/30";
    case "C": return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30";
    case "D": return "bg-orange-500/15 text-orange-600 border-orange-500/30";
    default:  return "bg-red-500/15 text-red-600 border-red-500/30";
  }
}

function scoreColor(value: number) {
  if (value >= 80) return "text-green-500";
  if (value >= 60) return "text-yellow-500";
  if (value >= 40) return "text-orange-500";
  return "text-red-500";
}

export function AnalysisSummaryCard({
  analysis,
  loading,
}: {
  analysis: Analysis | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="flex flex-col min-h-[420px]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1 mr-2">
              <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-8 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-3 w-full bg-muted rounded animate-pulse mt-1" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground/60">Running analysis…</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[280px] border-dashed text-muted-foreground/50">
        <p className="text-xs">Analysis unavailable</p>
      </Card>
    );
  }

  const [owner, name] = analysis.repo.full_name.split("/");
  const langTotal = Object.values(analysis.languages).reduce((a: number, b) => a + Number(b), 0);
  const topLangs = Object.entries(analysis.languages)
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 3);

  const scores = [
    { label: "Commit Health", value: analysis.score.commit_health },
    { label: "Documentation", value: analysis.score.documentation },
    { label: "Community",     value: analysis.score.community },
    { label: "Activity",      value: analysis.score.activity },
  ];

  return (
    <Card className="flex flex-col hover:border-foreground/25 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{owner}</p>
            <h3 className="font-semibold text-sm truncate leading-tight">{name}</h3>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 leading-5 ${gradeColor(analysis.score.grade)}`}>
            {analysis.score.grade}
          </span>
        </div>
        {analysis.repo.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {analysis.repo.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Overall score</span>
          <span className={`text-3xl font-bold tabular-nums leading-none ${scoreColor(analysis.score.overall)}`}>
            {analysis.score.overall}
            <span className="text-xs text-muted-foreground font-normal ml-0.5">/100</span>
          </span>
        </div>

        <div className="space-y-2.5">
          {scores.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={`text-xs font-medium tabular-nums ${scoreColor(value)}`}>{value}</span>
              </div>
              <Progress value={value} className="h-1" />
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <GitCommitHorizontal className="w-3 h-3" />
            Commit activity (16 wks)
          </p>
          <CommitChart data={analysis.commit_weekly} height={56} />
        </div>

        <div className="rounded-md bg-muted/50 p-3 border border-muted">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {analysis.ai_summary}
            </p>
          </div>
        </div>

        {langTotal > 0 && topLangs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topLangs.map(([lang, bytes]) => (
              <span
                key={lang}
                className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: getLangColor(lang) }} />
                {lang} · {Math.round((Number(bytes) / langTotal) * 100)}%
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/analyze/${owner}/${name}`}
          className="mt-auto flex items-center justify-end gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          View full analysis
          <ArrowRight className="w-3 h-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
