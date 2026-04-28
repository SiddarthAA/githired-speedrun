import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AiSummary({
  text,
  score,
}: {
  text: string;
  score: number;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 rounded-md bg-muted">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">AI Analysis</span>
              <span className="text-xs text-muted-foreground">
                Overall score: {score}/100
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {text}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
