import { Sparkles, TrendingUp } from "lucide-react";

function scoreColor(v: number) {
  if (v >= 80) return "text-green-500";
  if (v >= 60) return "text-yellow-500";
  if (v >= 40) return "text-orange-500";
  return "text-red-500";
}

export function AiSummary({
  text,
  score,
}: {
  text: string;
  score: number;
}) {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-muted/50 via-muted/20 to-transparent p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-background border shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-sm font-semibold">AI Analysis</span>
            <p className="text-xs text-muted-foreground">Powered by Groq · llama-3.3-70b</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
          <span className={`text-2xl font-bold tabular-nums leading-none ${scoreColor(score)}`}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="border-t pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
