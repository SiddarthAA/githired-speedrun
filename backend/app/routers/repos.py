from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.services.github_service import GitHubService
from app.services.cache_service import cache_get, cache_set, make_key

router = APIRouter()


@router.get("/")
async def list_repos(k: int = Query(default=10, le=30), user=Depends(get_current_user)):
    key = make_key(user["login"], "repos", str(k))
    cached = cache_get(key)
    if cached:
        return cached

    svc = GitHubService(user["github_token"])
    repos = svc.get_top_repos(k)
    cache_set(key, repos, ttl_seconds=300)
    return repos
