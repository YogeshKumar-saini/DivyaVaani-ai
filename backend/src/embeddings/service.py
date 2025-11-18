"""Centralized embedding service with caching."""

import numpy as np
from typing import List, Optional
from pathlib import Path
from sklearn.preprocessing import normalize

from src.embeddings.generator import EmbeddingGenerator
from src.embeddings.cache import EmbeddingCache
from src.utils.logger import log


class EmbeddingService:
    """Centralized embedding generation service with caching."""
    
    def __init__(
        self,
        model_name: str,
        use_api: bool = False,
        cache_dir: Optional[Path] = None,
        enable_cache: bool = True
    ):
        """Initialize embedding service.
        
        Args:
            model_name: Name of embedding model
            use_api: Whether to use API-based embeddings
            cache_dir: Directory for cache storage
            enable_cache: Whether to enable caching
        """
        self.model_name = model_name
        self.use_api = use_api
        
        # Initialize generator
        self.generator = EmbeddingGenerator(model_name, use_api)
        
        # Initialize cache
        cache_dir = cache_dir or Path("cache/embeddings")
        self.cache = EmbeddingCache(cache_dir, enabled=enable_cache)
        
        log.info(f"Initialized EmbeddingService with model: {model_name}")
        log.info(f"Cache enabled: {enable_cache}")
    
    def generate_batch(
        self,
        texts: List[str],
        batch_size: int = 64,
        normalize_embeddings: bool = True
    ) -> np.ndarray:
        """Generate embeddings for batch of texts with caching.
        
        Args:
            texts: List of texts to embed
            batch_size: Batch size for processing
            normalize_embeddings: Whether to normalize embeddings
            
        Returns:
            Array of embeddings
        """
        embeddings = []
        texts_to_generate = []
        text_indices = []
        
        # Check cache for each text
        for i, text in enumerate(texts):
            cached_embedding = self.cache.get(text, self.model_name)
            if cached_embedding is not None:
                embeddings.append((i, cached_embedding))
            else:
                texts_to_generate.append(text)
                text_indices.append(i)
        
        # Generate embeddings for uncached texts
        if texts_to_generate:
            log.info(f"Generating embeddings for {len(texts_to_generate)} texts (cache misses)")
            new_embeddings = self.generator.generate(
                texts=texts_to_generate,
                batch_size=batch_size,
                normalize_embeddings=normalize_embeddings
            )
            
            # Cache new embeddings
            for text, embedding in zip(texts_to_generate, new_embeddings):
                self.cache.set(text, self.model_name, embedding)
            
            # Add to results with correct indices
            for idx, embedding in zip(text_indices, new_embeddings):
                embeddings.append((idx, embedding))
        
        # Sort by original index and extract embeddings
        embeddings.sort(key=lambda x: x[0])
        result = np.array([emb for _, emb in embeddings])
        
        # Log cache stats
        stats = self.cache.get_stats()
        log.info(f"Cache stats - Hits: {stats['hits']}, Misses: {stats['misses']}, Hit rate: {stats['hit_rate']:.2%}")
        
        return result
    
    def generate_single(self, text: str, normalize_embedding: bool = True) -> np.ndarray:
        """Generate embedding for single text with caching.
        
        Args:
            text: Text to embed
            normalize_embedding: Whether to normalize embedding
            
        Returns:
            Embedding vector
        """
        # Check cache
        cached_embedding = self.cache.get(text, self.model_name)
        if cached_embedding is not None:
            return cached_embedding
        
        # Generate new embedding
        embedding = self.generator.generate_single(text)
        
        if normalize_embedding:
            embedding = embedding / np.linalg.norm(embedding)
        
        # Cache it
        self.cache.set(text, self.model_name, embedding)
        
        return embedding
    
    def get_cache_stats(self) -> dict:
        """Get cache statistics.
        
        Returns:
            Dictionary with cache stats
        """
        return self.cache.get_stats()
    
    def clear_cache(self) -> None:
        """Clear embedding cache."""
        self.cache.clear()
        log.info("Embedding cache cleared")
