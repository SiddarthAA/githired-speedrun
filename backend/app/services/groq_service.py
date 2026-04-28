from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.groq_api_key)


def generate_repo_summary(
    repo: dict, score_data: dict, commits: list, languages: dict
) -> str:
    top_langs = ", ".join(list(languages.keys())[:4]) if languages else "unknown"
    recent_msgs = [c["message"] for c in commits[:10]]

    prompt = f"""You are a senior software engineer reviewing a GitHub repository. 
Provide a concise, insightful analysis in 3-4 sentences. Be specific, not generic.

Repository: {repo['full_name']}
Description: {repo.get('description', 'None')}
Languages: {top_langs}
Stars: {repo['stars']} | Forks: {repo['forks']} | Open issues: {repo['open_issues']}
Overall score: {score_data['overall']}/100 (Grade: {score_data['grade']})
Commit health: {score_data['commit_health']}/100
Documentation: {score_data['documentation']}/100
Community: {score_data['community']}/100
Activity: {score_data['activity']}/100
Recent commit messages: {'; '.join(recent_msgs)}

Write a direct, honest assessment. Highlight the strongest aspect and the most important thing to improve.
Do not use bullet points. Do not start with "This repository". Be specific about the codebase."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()
