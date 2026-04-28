import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.backendJwt) {
    config.headers.Authorization = `Bearer ${session.backendJwt}`;
  }
  return config;
});

export type Repo = {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  updated_at: string;
  license: string | null;
  topics: string[];
};

export type Score = {
  commit_health: number;
  documentation: number;
  community: number;
  activity: number;
  overall: number;
  grade: string;
};

export type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  additions: number;
  deletions: number;
};

export type Analysis = {
  repo: Repo;
  score: Score;
  commits: Commit[];
  commit_weekly: { week: string; count: number }[];
  languages: Record<string, number>;
  contributors: { login: string; contributions: number }[];
  pull_requests: { open: number; closed: number };
  ai_summary: string;
};

export const fetchRepos = (k = 10) =>
  api.get<Repo[]>(`/repos?k=${k}`).then((r) => r.data);

export const fetchAnalysis = (owner: string, repo: string) =>
  api.get<Analysis>(`/analysis/${owner}/${repo}`).then((r) => r.data);
