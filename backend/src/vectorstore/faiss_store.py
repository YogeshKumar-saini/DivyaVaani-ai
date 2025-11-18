"""FAISS vector store implementation."""

import faiss
import numpy as np
from pathlib import Path
from typing import Tuple, List
from src.utils.logger import log


class FAISSStore:
    """FAISS vector store for similarity search."""
    
    def __init__(self, index_path: str):
        self.index_path = Path(index_path)
        self.index = None
        self.dimension = None
    
    def create_index(self, embeddings: np.ndarray):
        """Create FAISS index from embeddings."""
        self.dimension = embeddings.shape[1]
        log.info(f"Creating FAISS index with dimension: {self.dimension}")
        
        # Use IndexFlatIP for cosine similarity (with normalized vectors)
        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(embeddings.astype('float32'))
        
        log.info(f"FAISS index created with {self.index.ntotal} vectors")
    
    def save(self):
        """Save FAISS index to disk."""
        if self.index is None:
            raise ValueError("No index to save. Create index first.")
        
        self.index_path.parent.mkdir(exist_ok=True, parents=True)
        faiss.write_index(self.index, str(self.index_path))
        log.info(f"FAISS index saved to {self.index_path}")
    
    def load(self):
        """Load FAISS index from disk."""
        if not self.index_path.exists():
            raise FileNotFoundError(f"Index not found at {self.index_path}")
        
        log.info(f"Loading FAISS index from {self.index_path}")
        self.index = faiss.read_index(str(self.index_path))
        self.dimension = self.index.d
        log.info(f"FAISS index loaded with {self.index.ntotal} vectors")
    
    def search(
        self,
        query_embedding: np.ndarray,
        k: int = 5
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Search for similar vectors."""
        if self.index is None:
            raise ValueError("Index not loaded. Load or create index first.")
        
        query_embedding = query_embedding.astype('float32')
        if len(query_embedding.shape) == 1:
            query_embedding = query_embedding.reshape(1, -1)
        
        distances, indices = self.index.search(query_embedding, k)
        return distances[0], indices[0]
