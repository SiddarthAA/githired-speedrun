from pydantic import BaseModel
from typing import Optional


class RepoOut(BaseModel):
    name: str
    full_name: str
    description: Optional[str]
    language: Optional[str]
    stars: int
    forks: int
    open_issues: int
    created_at: str
    updated_at: str
    default_branch: str
    has_wiki: bool
    has_issues: bool
    license: Optional[str]
    topics: list[str]
    size_kb: int


class ScoreOut(BaseModel):
    commit_health: float
    documentation: float
    community: float
    activity: float
    overall: float
    grade: str


class CommitOut(BaseModel):
    sha: str
    message: str
    author: str
    date: str
    additions: int
    deletions: int


class WeeklyCommit(BaseModel):
    week: str
    count: int


class ContributorOut(BaseModel):
    login: str
    contributions: int


class PullRequestStats(BaseModel):
    open: int
    closed: int


class AnalysisOut(BaseModel):
    repo: RepoOut
    score: ScoreOut
    commits: list[CommitOut]
    commit_weekly: list[WeeklyCommit]
    languages: dict[str, int]
    contributors: list[ContributorOut]
    pull_requests: PullRequestStats
    ai_summary: str
