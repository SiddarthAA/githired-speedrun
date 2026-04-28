"use client";
import { useEffect, useState } from "react";
import { fetchAnalysis, type Analysis } from "@/lib/api";
import { CommitChart } from "@/components/commit-chart";
import { AiSummary } from "@/components/ai-summary";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  Star,
  GitFork,
  AlertCircle,
  GitPullRequest,
  Users,
  GitCommitHorizontal,
} from "lucide-react";
import Link from "next/link";
import { getLangColor } from "@/lib/lang-colors";

// ─── helpers ───────────────────────────────────────────────────────────────

const LOAD_STEPS = [
  "Fetching repository data",
  "Reading commit history",
  "Analyzing code patterns",
  "Computing quality scores",
  "Generating AI insights",
];

function scoreColor(v: number) {
  if (v >= 80) return "text-green-500";
  if (v >= 60) return "text-yellow-500";
  if (v >= 40) return "text-orange-500";
  return "text-red-500";
}

function scoreBg(v: number) {
  if (v >= 80) return "bg-green-500";
  if (v >= 60) return "bg-yellow-500";
  if (v >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function gradeColor(g: string) {
  switch (g) {
    case "A": return "bg-green-500/10 text-green-600 border-green-500/30";
    case "B": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "C": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
    case "D": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
    default:  return "bg-red-500/10 text-red-600 border-red-500/30";
  }
}

// ─── loading state ──────────────────────────────────────────────────────────

function AnalysisLoading({ owner, repo }: { owner: string; repo: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => (s < LOAD_STEPS.length - 1 ? s + 1 : s)),
      1600
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-muted-foreground">{owner}</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-medium">{repo}</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-muted border-t-foreground animate-spin mx-auto mb-8" />
          <h2 className="text-base font-semibold mb-1">Analyzing repository</h2>
          <p className="text-sm text-muted-foreground mb-10">
            <span className="font-medium text-foreground">
              {owner}/{repo}
            </span>{" "}
            — this may take a moment
          </p>

          <div className="space-y-3 text-left w-60 mx-auto">
            {LOAD_STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                  i <= step ? "text-foreground" : "text-muted-foreground/25"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    i < step
                      ? "border-green-500/60 bg-green-500/10"
                      : i === step
                      ? "border-foreground/50 bg-foreground/5"
                      : "border-muted-foreground/15"
                  }`}
                >
                  {i < step && <Check className="w-2 h-2 text-green-500" />}
                  {i === step && (
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                  )}
                </div>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── main page ──────────────────────────────────────────────────────────────

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
      .catch(() =>
        setError(
          "Analysis failed. The backend may be unavailable or the repository could not be accessed."
        )
      )
      .finally(() => setLoading(false));
  }, [owner, repo]);

  if (loading) return <AnalysisLoading owner={owner} repo={repo} />;

  if (error)
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );

  if (!data) return null;

  const langTotal = Object.values(data.languages).reduce(
    (a: number, b) => a + Number(b),
    0
  );
  const langEntries = Object.entries(data.languages).sort(
    ([, a], [, b]) => Number(b) - Number(a)
  );

  const prTotal = data.pull_requests.open + data.pull_requests.closed;
  const weeklyTotal = data.commit_weekly.reduce((s, w) => s + w.count, 0);
  const activeWeeks = data.commit_weekly.filter((w) => w.count > 0).length;
  const peakWeek = data.commit_weekly.reduce(
    (m, w) => (w.count > m.count ? w : m),
    { week: "", count: 0 }
  );

  const dims = [
    {
      label: "Commit Health",
      value: data.score.commit_health,
      desc: "Message quality, consistency & bus factor",
    },
    {
      label: "Documentation",
      value: data.score.documentation,
      desc: "README, wiki, license & topics",
    },
    {
      label: "Community",
      value: data.score.community,
      desc: "Contributors, stars & PR engagement",
    },
    {
      label: "Activity",
      value: data.score.activity,
      desc: "Recency & commit volume",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-muted-foreground">{owner}</span>
          <span className="text-muted-foreground/30">/</span>
          <span className="text-sm font-medium">{repo}</span>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {data.repo.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                {data.repo.forks.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitPullRequest className="w-3 h-3" />
                {prTotal}
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border ${gradeColor(data.score.grade)}`}
            >
              Grade {data.score.grade}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Repo title */}
        <div>
          <h1 className="text-xl font-semibold">{repo}</h1>
          {data.repo.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.repo.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {data.repo.language && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: getLangColor(data.repo.language) }}
                />
                {data.repo.language}
              </span>
            )}
            {data.repo.topics.slice(0, 5).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        {/* Score overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Big score card */}
          <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/20 p-6 text-center gap-3">
            <div
              className={`text-5xl font-bold tabular-nums ${scoreColor(data.score.overall)}`}
            >
              {data.score.overall}
            </div>
            <div className="text-xs text-muted-foreground -mt-1">
              overall score
            </div>
            <div
              className={`text-sm font-bold px-3 py-1 rounded-md border ${gradeColor(data.score.grade)}`}
            >
              Grade {data.score.grade}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              <div className="rounded-lg bg-muted/60 px-2 py-2 text-center">
                <div className="text-sm font-semibold">
                  {data.commits.length}
                </div>
                <div className="text-xs text-muted-foreground">commits</div>
              </div>
              <div className="rounded-lg bg-muted/60 px-2 py-2 text-center">
                <div className="text-sm font-semibold">{prTotal}</div>
                <div className="text-xs text-muted-foreground">PRs</div>
              </div>
            </div>
          </div>

          {/* Dimension bars */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-4">
            {dims.map(({ label, value, desc }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                      {desc}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums ${scoreColor(value)}`}
                  >
                    {value}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${scoreBg(value)}`}
                    style={{ width: `${value}%`, opacity: 0.75 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* AI Analysis */}
        <section>
          <AiSummary text={data.ai_summary} score={data.score.overall} />
        </section>

        <Separator />

        {/* Commit activity */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h3 className="text-sm font-medium">Commit Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 16 weeks
              </p>
            </div>
            <div className="flex gap-5 text-right">
              <div>
                <div className="text-sm font-semibold tabular-nums">
                  {weeklyTotal}
                </div>
                <div className="text-xs text-muted-foreground">total</div>
              </div>
              <div>
                <div className="text-sm font-semibold tabular-nums">
                  {activeWeeks}
                </div>
                <div className="text-xs text-muted-foreground">active wks</div>
              </div>
              <div>
                <div className="text-sm font-semibold tabular-nums">
                  {peakWeek.count}
                </div>
                <div className="text-xs text-muted-foreground">peak</div>
              </div>
            </div>
          </div>
          <CommitChart data={data.commit_weekly} height={140} variant="area" />
        </section>

        <Separator />

        {/* Languages */}
        <section>
          <h3 className="text-sm font-medium mb-4">Languages</h3>
          {langTotal > 0 ? (
            <>
              {/* Stacked colour bar */}
              <div className="flex h-2.5 rounded-full overflow-hidden mb-5 gap-px">
                {langEntries.slice(0, 8).map(([lang, bytes]) => (
                  <div
                    key={lang}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${(Number(bytes) / langTotal) * 100}%`,
                      background: getLangColor(lang),
                    }}
                  />
                ))}
              </div>
              {/* Rows */}
              <div className="space-y-2.5">
                {langEntries.map(([lang, bytes]) => (
                  <div key={lang} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: getLangColor(lang) }}
                    />
                    <span className="w-36 text-muted-foreground text-xs truncate">
                      {lang}
                    </span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(Number(bytes) / langTotal) * 100}%`,
                          background: getLangColor(lang),
                          opacity: 0.75,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                      {Math.round((Number(bytes) / langTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No language data available.
            </p>
          )}
        </section>

        <Separator />

        {/* Contributors + PRs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              Top Contributors
            </h3>
            <div className="space-y-3">
              {data.contributors.slice(0, 8).map((c, i) => (
                <div key={c.login} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 tabular-nums text-right">
                    {i + 1}
                  </span>
                  <img
                    src={`https://avatars.githubusercontent.com/${c.login}?s=28`}
                    className="w-6 h-6 rounded-full"
                    alt={c.login}
                  />
                  <span className="text-sm flex-1 truncate">{c.login}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {c.contributions}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <GitPullRequest className="w-3.5 h-3.5 text-muted-foreground" />
              Pull Requests
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border bg-muted/20 p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {data.pull_requests.open}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Open
                  </div>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4 text-center">
                  <div className="text-2xl font-bold">
                    {data.pull_requests.closed}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Closed
                  </div>
                </div>
              </div>
              {prTotal > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Merge / Close rate</span>
                    <span>
                      {Math.round(
                        (data.pull_requests.closed / prTotal) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/50 rounded-full"
                      style={{
                        width: `${(data.pull_requests.closed / prTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Recent commits */}
        {data.commits.length > 0 && (
          <>
            <Separator />
            <section>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <GitCommitHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                Recent Commits
              </h3>
              <div className="border rounded-xl overflow-hidden">
                {data.commits.slice(0, 12).map((commit, i) => (
                  <div
                    key={commit.sha}
                    className={`flex items-start gap-3 px-4 py-3 text-xs hover:bg-muted/30 transition-colors ${
                      i !== Math.min(data.commits.length, 12) - 1
                        ? "border-b"
                        : ""
                    }`}
                  >
                    <code className="text-muted-foreground font-mono shrink-0 mt-0.5 w-12 tabular-nums">
                      {commit.sha}
                    </code>
                    <span className="flex-1 text-sm leading-snug truncate">
                      {commit.message}
                    </span>
                    <span className="text-muted-foreground shrink-0 hidden sm:block">
                      {commit.author}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(commit.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
