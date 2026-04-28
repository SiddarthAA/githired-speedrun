from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.services.github_service import GitHubService
from app.services.analysis_service import AnalysisService
from app.services.groq_service import generate_repo_summary
from app.services.cache_service import cache_get, cache_set, make_key
import asyncio

router = APIRouter()
analysis_svc = AnalysisService()


@router.get("/{owner}/{repo}")
async def analyze_repo(owner: str, repo: str, user=Depends(get_current_user)):
    key = make_key(user["login"], "analysis", owner, repo)
    cached = cache_get(key)
    if cached:
        return cached

    gh = GitHubService(user["github_token"])

    loop = asyncio.get_event_loop()
    repo_data, commits, languages, contributors, prs = await asyncio.gather(
        loop.run_in_executor(None, gh.get_repo_details, owner, repo),
        loop.run_in_executor(None, gh.get_commits, owner, repo, 100),
        loop.run_in_executor(None, gh.get_languages, owner, repo),
        loop.run_in_executor(None, gh.get_contributors, owner, repo),
        loop.run_in_executor(None, gh.get_pull_requests, owner, repo),
    )

    score = analysis_svc.score_repo(repo_data, commits, contributors, prs)
    weekly = analysis_svc.commit_frequency_by_week(commits)
    summary = generate_repo_summary(repo_data, score.__dict__, commits, languages)

    result = {
        "repo": repo_data,
        "score": score.__dict__,
        "commits": commits[:50],  # return last 50 for the timeline
        "commit_weekly": weekly,
        "languages": languages,
        "contributors": contributors,
        "pull_requests": prs,
        "ai_summary": summary,
    }

    cache_set(key, result, ttl_seconds=600)  # cache 10 min
    return result
