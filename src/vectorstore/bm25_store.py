"""BM25 keyword-based retrieval."""

import pickle
import nltk
from typing import List, Tuple
from pathlib import Path
from rank_bm25 import BM25Okapi
from src.utils.logger import log


# Download NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)


class BM25Store:
    """BM25 keyword-based search."""
    
    def __init__(self, store_path: str = "artifacts/bm25.pkl"):
        self.store_path = Path(store_path)
        self.bm25 = None
        self.corpus = None
    
    def create_index(self, texts: List[str]):
        """Create BM25 index from texts."""
        log.info(f"Creating BM25 index for {len(texts)} documents")
        
        self.corpus = texts
        tokenized_corpus = [
            nltk.word_tokenize(text.lower())
            for text in texts
        ]
        
        self.bm25 = BM25Okapi(tokenized_corpus)
        log.info("BM25 index created successfully")
    
    def save(self):
        """Save BM25 index to disk."""
        if self.bm25 is None:
            raise ValueError("No BM25 index to save")
        
        self.store_path.parent.mkdir(exist_ok=True, parents=True)
        with open(self.store_path, 'wb') as f:
            pickle.dump({'bm25': self.bm25, 'corpus': self.corpus}, f)
        
        log.info(f"BM25 index saved to {self.store_path}")
    
    def load(self):
        """Load BM25 index from disk."""
        if not self.store_path.exists():
            raise FileNotFoundError(f"BM25 index not found at {self.store_path}")
        
        log.info(f"Loading BM25 index from {self.store_path}")
        with open(self.store_path, 'rb') as f:
            data = pickle.load(f)
            self.bm25 = data['bm25']
            self.corpus = data['corpus']
        
        log.info("BM25 index loaded successfully")
    
    def search(self, query: str, k: int = 20) -> List[int]:
        """Search using BM25."""
        if self.bm25 is None:
            raise ValueError("BM25 index not loaded")
        
        query_tokens = nltk.word_tokenize(query.lower())
        scores = self.bm25.get_scores(query_tokens)
        
        # Get top k indices
        top_indices = sorted(
            range(len(scores)),
            key=lambda i: scores[i],
            reverse=True
        )[:k]
        
        return top_indices
