from fastapi import APIRouter, HTTPException
import httpx
from app.core.config import settings
from app.core.security import create_access_token

router = APIRouter()


@router.get("/github/callback")
async def github_callback(code: str):
    """Exchange GitHub code for access token, return our JWT."""
    async with httpx.AsyncClient() as client:
        # Step 1: exchange code for GitHub token
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_resp.json()
        if "error" in token_data:
            raise HTTPException(400, token_data["error_description"])

        github_token = token_data["access_token"]

        # Step 2: fetch GitHub user
        user_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {github_token}"},
        )
        user = user_resp.json()

    # Step 3: issue our own JWT (embed github_token so backend can use it)
    our_token = create_access_token(
        {
            "sub": str(user["id"]),
            "login": user["login"],
            "avatar": user.get("avatar_url"),
            "github_token": github_token,  # stored only in JWT, never in DB
        }
    )

    return {
        "access_token": our_token,
        "user": {"login": user["login"], "avatar": user.get("avatar_url")},
    }
