import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ScoreRadial({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 80
      ? "text-green-500"
      : value >= 60
        ? "text-yellow-500"
        : value >= 40
          ? "text-orange-500"
          : "text-red-500";

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className={`text-lg font-semibold tabular-nums ${color}`}>
            {value}
          </span>
        </div>
        <Progress value={value} className="h-1" />
      </CardContent>
    </Card>
  );
}
