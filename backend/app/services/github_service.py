from github import Github
from typing import Optional


class GitHubService:
    def __init__(self, token: str):
        self.g = Github(token)
        self.token = token

    def get_top_repos(self, k: int = 10) -> list[dict]:
        """Fetch user's top K repos sorted by stars."""
        user = self.g.get_user()
        repos = sorted(
            user.get_repos(type="owner"),
            key=lambda r: r.stargazers_count,
            reverse=True,
        )[:k]
        return [self._serialize_repo(r) for r in repos]

    def get_repo_details(self, owner: str, repo_name: str) -> dict:
        repo = self.g.get_repo(f"{owner}/{repo_name}")
        return self._serialize_repo(repo)

    def get_commits(self, owner: str, repo_name: str, limit: int = 100) -> list[dict]:
        repo = self.g.get_repo(f"{owner}/{repo_name}")
        commits = []
        for commit in repo.get_commits()[:limit]:
            commits.append(
                {
                    "sha": commit.sha[:7],
                    "message": commit.commit.message.split("\n")[0][:80],
                    "author": commit.commit.author.name,
                    "date": commit.commit.author.date.isoformat(),
                    "additions": commit.stats.additions if commit.stats else 0,
                    "deletions": commit.stats.deletions if commit.stats else 0,
                }
            )
        return commits

    def get_languages(self, owner: str, repo_name: str) -> dict:
        repo = self.g.get_repo(f"{owner}/{repo_name}")
        return repo.get_languages()

    def get_contributors(self, owner: str, repo_name: str) -> list[dict]:
        repo = self.g.get_repo(f"{owner}/{repo_name}")
        return [
            {"login": c.login, "contributions": c.contributions}
            for c in repo.get_contributors()[:20]
        ]

    def get_pull_requests(self, owner: str, repo_name: str) -> dict:
        repo = self.g.get_repo(f"{owner}/{repo_name}")
        open_prs = repo.get_pulls(state="open").totalCount
        closed_prs = repo.get_pulls(state="closed").totalCount
        return {"open": open_prs, "closed": closed_prs}

    def _serialize_repo(self, repo) -> dict:
        return {
            "name": repo.name,
            "full_name": repo.full_name,
            "description": repo.description,
            "language": repo.language,
            "stars": repo.stargazers_count,
            "forks": repo.forks_count,
            "open_issues": repo.open_issues_count,
            "created_at": repo.created_at.isoformat(),
            "updated_at": repo.updated_at.isoformat(),
            "default_branch": repo.default_branch,
            "has_wiki": repo.has_wiki,
            "has_issues": repo.has_issues,
            "license": repo.license.name if repo.license else None,
            "topics": repo.get_topics(),
            "size_kb": repo.size,
        }
