from upstash_redis import Redis
from app.core.config import settings
import json

redis = Redis(
    url=settings.upstash_redis_rest_url, token=settings.upstash_redis_rest_token
)


def cache_get(key: str):
    val = redis.get(key)
    return json.loads(val) if val else None


def cache_set(key: str, value, ttl_seconds: int = 300):
    redis.setex(key, ttl_seconds, json.dumps(value))


def make_key(user_login: str, *parts: str) -> str:
    return f"gh-analyzer:{user_login}:{':'.join(parts)}"
