"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, GitFork, AlertCircle } from "lucide-react";
import { type Repo } from "@/lib/api";

export function RepoCard({ repo }: { repo: Repo }) {
  const [owner, name] = repo.full_name.split("/");

  return (
    <Link href={`/analyze/${owner}/${name}`}>
      <Card className="hover:border-foreground/20 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">{owner}</p>
              <h3 className="font-medium text-sm">{name}</h3>
            </div>
            {repo.language && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {repo.language}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {repo.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {repo.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {repo.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              {repo.forks.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {repo.open_issues}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
