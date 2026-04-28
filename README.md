# GitHub Analyzer

AI-powered code quality insights for your GitHub repositories.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + shadcn/ui + Tailwind CSS → Vercel
- **Backend**: Python 3.12 + FastAPI + uv → Render
- **LLM**: Groq (llama-3.3-70b-versatile)
- **Auth**: GitHub OAuth via NextAuth.js
- **Cache**: Upstash Redis (REST API)
- **DB**: Supabase (Postgres, optional for persisting history)

## Features

- GitHub OAuth login
- Top repos dashboard sorted by stars
- Per-repo analysis: commit health, documentation score, community score, activity score
- Weekly commit frequency chart
- Language breakdown
- Top contributors
- Groq-generated plain-English AI summary

## Local Development

### Backend

```bash
cd backend
cp .env.example .env   # fill in your keys
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local   # fill in your keys
npm install
npm run dev
```

## Deployment

- **Frontend**: push to GitHub → Vercel auto-deploys
- **Backend**: push to GitHub → Render auto-deploys via `render.yaml`

See the implementation docs for full setup instructions including GitHub OAuth app config, Upstash Redis, and Supabase.

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GROQ_API_KEY` | Groq API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `JWT_SECRET` | Random secret (`openssl rand -hex 32`) |
| `FRONTEND_URL` | Frontend origin for CORS |

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `NEXTAUTH_URL` | App base URL |
| `NEXTAUTH_SECRET` | Random secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
