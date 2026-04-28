from fastapi import APIRouter, HTTPException
import httpx
from app.core.security import create_access_token

router = APIRouter()


@router.get("/github/callback")
async def github_callback(token: str):
    """Receive a GitHub access token from the frontend (NextAuth has already done the OAuth exchange).
    Fetch the GitHub user and return our own JWT."""
    async with httpx.AsyncClient() as client:
        user_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {token}"},
        )
        if user_resp.status_code != 200:
            raise HTTPException(400, "Invalid GitHub token")
        user = user_resp.json()

    our_token = create_access_token(
        {
            "sub": str(user["id"]),
            "login": user["login"],
            "avatar": user.get("avatar_url"),
            "github_token": token,  # stored only in JWT, never in DB
        }
    )

    return {
        "access_token": our_token,
        "user": {"login": user["login"], "avatar": user.get("avatar_url")},
    }

