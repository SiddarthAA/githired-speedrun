"use client";
import { type Analysis } from "@/lib/api";

function getGrade(score: number) {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
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

const STRENGTH_MSG: Record<string, string> = {
  "Commit Health": "writes well-structured, consistent commits",
  Documentation: "keeps repositories clearly documented",
  Community: "builds strong community engagement",
  Activity: "actively maintains their codebase",
};

const WEAKNESS_MSG: Record<string, string> = {
  "Commit Health": "commit consistency and message quality could improve",
  Documentation: "repositories could use better documentation",
  Community: "community engagement is an area to grow",
  Activity: "some repos would benefit from more frequent updates",
};

export function AccountSummary({
  analyses,
}: {
  analyses: (Analysis | null)[];
}) {
  const completed = analyses.filter((a): a is Analysis => a !== null);
  if (completed.length === 0) return null;

  const avg = (fn: (a: Analysis) => number) =>
    Math.round(
      (completed.reduce((s, a) => s + fn(a), 0) / completed.length) * 10
    ) / 10;

  const avgOverall = avg((a) => a.score.overall);
  const dims = [
    { name: "Commit Health", value: avg((a) => a.score.commit_health) },
    { name: "Documentation",  value: avg((a) => a.score.documentation) },
    { name: "Community",      value: avg((a) => a.score.community) },
    { name: "Activity",       value: avg((a) => a.score.activity) },
  ];

  const sorted = [...dims].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  // Primary language across all repos
  const allLangs: Record<string, number> = {};
  for (const a of completed) {
    for (const [lang, bytes] of Object.entries(a.languages)) {
      allLangs[lang] = (allLangs[lang] || 0) + Number(bytes);
    }
  }
  const primaryLang =
    Object.entries(allLangs).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";

  const totalCommits = completed.reduce((s, a) => s + a.commits.length, 0);
  const grade = getGrade(avgOverall);

  return (
    <div className="rounded-xl border bg-muted/10 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Score + grade */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="text-center shrink-0">
            <div
              className={`text-4xl font-bold tabular-nums leading-none ${scoreColor(avgOverall)}`}
            >
              {avgOverall}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              account score
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold">Account Overview</h3>
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded border ${gradeColor(grade)}`}
              >
                Grade {grade}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on {completed.length} analyzed{" "}
              {completed.length === 1 ? "repository" : "repositories"}, this
              developer{" "}
              <span className="text-foreground font-medium">
                {STRENGTH_MSG[strongest.name]}
              </span>
              . Their strongest area is{" "}
              <span className="text-foreground font-medium">
                {strongest.name.toLowerCase()}
              </span>{" "}
              ({strongest.value}/100).{" "}
              {WEAKNESS_MSG[weakest.name].charAt(0).toUpperCase() +
                WEAKNESS_MSG[weakest.name].slice(1)}
              .
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {[
            { label: "Commits", value: String(totalCommits) },
            { label: "Primary lang", value: primaryLang },
            { label: "Best area", value: strongest.name.split(" ")[0] },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="text-center px-4 py-3 rounded-lg bg-muted/50 border"
            >
              <div className="text-sm font-semibold truncate">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dimension bars */}
      <div className="mt-5 pt-5 border-t grid grid-cols-2 md:grid-cols-4 gap-5">
        {dims.map(({ name, value }) => (
          <div key={name} className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{name}</span>
              <span
                className={`text-xs font-medium tabular-nums ${scoreColor(value)}`}
              >
                {value}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreBg(value)}`}
                style={{ width: `${value}%`, opacity: 0.7 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
