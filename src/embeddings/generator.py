"""Embedding generation using sentence transformers."""

import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
from src.utils.logger import log


class EmbeddingGenerator:
    """Generate embeddings for text using sentence transformers."""
    
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.model = None
    
    def load_model(self):
        """Load the embedding model."""
        if self.model is None:
            log.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            log.info("Embedding model loaded successfully")
    
    def generate(
        self,
        texts: List[str],
        batch_size: int = 64,
        normalize_embeddings: bool = True
    ) -> np.ndarray:
        """Generate embeddings for a list of texts."""
        self.load_model()
        
        log.info(f"Generating embeddings for {len(texts)} texts")
        embeddings = self.model.encode(
            texts,
            show_progress_bar=True,
            convert_to_numpy=True,
            batch_size=batch_size
        )
        
        if normalize_embeddings:
            embeddings = normalize(embeddings)
        
        log.info(f"Generated embeddings with shape: {embeddings.shape}")
        return embeddings
    
    def generate_single(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        self.load_model()
        embedding = self.model.encode(text, convert_to_numpy=True)
        embedding = embedding / np.linalg.norm(embedding)
        return embedding
