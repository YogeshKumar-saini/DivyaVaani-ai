"""Embedding cache for avoiding recomputation."""

import hashlib
import pickle
from pathlib import Path
from typing import Optional
import numpy as np
from src.utils.logger import log


class EmbeddingCache:
    """Cache for storing and retrieving embeddings."""
    
    def __init__(self, cache_dir: Path, enabled: bool = True):
        """Initialize embedding cache.
        
        Args:
            cache_dir: Directory for cache storage
            enabled: Whether caching is enabled
        """
        self.cache_dir = Path(cache_dir)
        self.enabled = enabled
        self.hits = 0
        self.misses = 0
        
        if self.enabled:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def get(self, text: str, model_name: str) -> Optional[np.ndarray]:
        """Get cached embedding for text.
        
        Args:
            text: Text to get embedding for
            model_name: Model name used for embedding
            
        Returns:
            Cached embedding or None if not found
        """
        if not self.enabled:
            return None
        
        cache_key = self._generate_key(text, model_name)
        cache_file = self.cache_dir / f"{cache_key}.pkl"
        
        if cache_file.exists():
            try:
                with open(cache_file, 'rb') as f:
                    embedding = pickle.load(f)
                self.hits += 1
                log.debug(f"Cache hit for key: {cache_key}")
                return embedding
            except Exception as e:
                log.warning(f"Error loading cached embedding: {e}")
                self.misses += 1
                return None
        
        self.misses += 1
        return None
    
    def set(self, text: str, model_name: str, embedding: np.ndarray) -> None:
        """Store embedding in cache.
        
        Args:
            text: Text that was embedded
            model_name: Model name used for embedding
            embedding: Embedding vector to cache
        """
        if not self.enabled:
            return
        
        cache_key = self._generate_key(text, model_name)
        cache_file = self.cache_dir / f"{cache_key}.pkl"
        
        try:
            with open(cache_file, 'wb') as f:
                pickle.dump(embedding, f)
            log.debug(f"Cached embedding for key: {cache_key}")
        except Exception as e:
            log.warning(f"Error caching embedding: {e}")
    
    def get_stats(self) -> dict:
        """Get cache statistics.
        
        Returns:
            Dictionary with cache stats
        """
        total = self.hits + self.misses
        hit_rate = self.hits / total if total > 0 else 0
        
        return {
            'hits': self.hits,
            'misses': self.misses,
            'total_requests': total,
            'hit_rate': hit_rate,
            'enabled': self.enabled
        }
    
    def clear(self) -> None:
        """Clear all cached embeddings."""
        if not self.enabled:
            return
        
        count = 0
        for cache_file in self.cache_dir.glob('*.pkl'):
            try:
                cache_file.unlink()
                count += 1
            except Exception as e:
                log.warning(f"Error deleting cache file {cache_file}: {e}")
        
        log.info(f"Cleared {count} cached embeddings")
        self.hits = 0
        self.misses = 0
    
    def _generate_key(self, text: str, model_name: str) -> str:
        """Generate cache key for text and model.
        
        Args:
            text: Text content
            model_name: Model name
            
        Returns:
            Cache key (hash)
        """
        # Create a unique key based on text content and model
        content = f"{model_name}:{text}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
