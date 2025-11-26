"""Cache manager for RAG system."""

from typing import Optional, Any
from src.api.cache import ResponseCache

class CacheManager:
    """Wrapper around ResponseCache to match MultilingualQASystem expectations."""

    def __init__(self, enable_caching: bool = True, cache_size: int = 1000):
        self.enabled = enable_caching
        self.cache = ResponseCache(max_size=cache_size)

    def get(self, key: str) -> Optional[Any]:
        """Get item from cache."""
        if not self.enabled:
            return None
        return self.cache.get(key)

    def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> None:
        """Set item in cache."""
        if not self.enabled:
            return
        # ResponseCache.set doesn't support per-item TTL in the current implementation
        # We'll just ignore it for now or we'd need to update ResponseCache
        self.cache.set(key, value)

    def is_enabled(self) -> bool:
        """Check if caching is enabled."""
        return self.enabled

    def get_stats(self) -> dict:
        """Get cache statistics."""
        return self.cache.stats()
