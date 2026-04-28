from dataclasses import dataclass
from datetime import datetime, timezone
import math


@dataclass
class RepoScore:
    commit_health: float  # 0-100
    documentation: float  # 0-100
    community: float  # 0-100
    activity: float  # 0-100
    overall: float  # 0-100
    grade: str  # A/B/C/D/F


class AnalysisService:
    def score_repo(
        self, repo: dict, commits: list, contributors: list, prs: dict
    ) -> RepoScore:
        commit_health = self._score_commits(commits)
        documentation = self._score_documentation(repo)
        community = self._score_community(repo, contributors, prs)
        activity = self._score_activity(repo, commits)
        overall = (
            commit_health * 0.35
            + documentation * 0.25
            + community * 0.2
            + activity * 0.2
        )
        return RepoScore(
            commit_health=round(commit_health, 1),
            documentation=round(documentation, 1),
            community=round(community, 1),
            activity=round(activity, 1),
            overall=round(overall, 1),
            grade=self._grade(overall),
        )

    def _score_commits(self, commits: list) -> float:
        if not commits:
            return 0.0
        score = 0.0
        # Conventional commit messages (feat/fix/chore/docs/etc.)
        conventional = sum(
            1
            for c in commits
            if any(
                c["message"].startswith(p)
                for p in [
                    "feat",
                    "fix",
                    "chore",
                    "docs",
                    "refactor",
                    "test",
                    "style",
                    "perf",
                    "ci",
                ]
            )
        )
        score += (conventional / len(commits)) * 40

        # Commit frequency: penalise bursts, reward consistency
        if len(commits) >= 10:
            dates = [
                datetime.fromisoformat(c["date"].replace("Z", "+00:00"))
                for c in commits
            ]
            gaps = [(dates[i] - dates[i + 1]).days for i in range(len(dates) - 1)]
            avg_gap = sum(gaps) / len(gaps) if gaps else 99
            score += max(0, 30 - avg_gap * 0.5)

        # Co-authorship / bus factor
        authors = {c["author"] for c in commits}
        bus_factor_score = min(30, len(authors) * 6)
        score += bus_factor_score

        return min(100, score)

    def _score_documentation(self, repo: dict) -> float:
        score = 0.0
        if repo.get("description"):
            score += 20
        if repo.get("has_wiki"):
            score += 15
        if repo.get("license"):
            score += 25
        if repo.get("topics"):
            score += min(20, len(repo["topics"]) * 5)
        # README presence assumed if description exists (GH API doesn't expose directly)
        score += 20  # base; extend by fetching README via API if desired
        return min(100, score)

    def _score_community(
        self, repo: dict, contributors: list, prs: dict
    ) -> float:
        score = 0.0
        score += min(40, len(contributors) * 8)
        total_prs = prs.get("open", 0) + prs.get("closed", 0)
        score += min(30, total_prs * 2)
        if repo.get("has_issues"):
            score += 15
        score += min(15, math.log1p(repo.get("stars", 0)) * 3)
        return min(100, score)

    def _score_activity(self, repo: dict, commits: list) -> float:
        score = 0.0
        updated = datetime.fromisoformat(
            repo["updated_at"].replace("Z", "+00:00")
        )
        days_since = (datetime.now(timezone.utc) - updated).days
        score += max(0, 50 - days_since * 0.5)
        score += min(50, len(commits) * 0.5)
        return min(100, score)

    def _grade(self, score: float) -> str:
        if score >= 85:
            return "A"
        if score >= 70:
            return "B"
        if score >= 55:
            return "C"
        if score >= 40:
            return "D"
        return "F"

    def commit_frequency_by_week(self, commits: list) -> list[dict]:
        """Return weekly commit counts for the last 16 weeks, filling empty weeks with 0."""
        from collections import defaultdict
        from datetime import timedelta

        weeks_map: dict = defaultdict(int)
        for c in commits:
            dt = datetime.fromisoformat(c["date"].replace("Z", "+00:00"))
            week = dt.strftime("%Y-W%W")
            weeks_map[week] += 1

        # Always return exactly 16 weeks ending this week, zero-filling gaps
        today = datetime.now(timezone.utc)
        result = []
        for i in range(15, -1, -1):
            day = today - timedelta(weeks=i)
            week_key = day.strftime("%Y-W%W")
            result.append({"week": week_key, "count": weeks_map.get(week_key, 0)})
        return result
