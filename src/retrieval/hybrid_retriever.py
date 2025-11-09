"""Hybrid retrieval combining BM25 and vector search."""

import numpy as np
import pandas as pd
from typing import List, Dict, Any
from src.vectorstore import FAISSStore, BM25Store
from src.embeddings import EmbeddingGenerator
from src.utils.logger import log


class HybridRetriever:
    """Hybrid retrieval using BM25 and FAISS."""
    
    def __init__(
        self,
        faiss_store: FAISSStore,
        bm25_store: BM25Store,
        embedding_generator: EmbeddingGenerator,
        dataframe: pd.DataFrame,
        embeddings: np.ndarray
    ):
        self.faiss_store = faiss_store
        self.bm25_store = bm25_store
        self.embedding_generator = embedding_generator
        self.df = dataframe
        self.embeddings = embeddings
    
    def retrieve(
        self,
        query: str,
        k_bm25: int = 20,
        k_faiss: int = 20,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Perform hybrid retrieval."""
        try:
            # BM25 search
            bm25_indices = self.bm25_store.search(query, k=k_bm25)
            
            # FAISS search
            query_embedding = self.embedding_generator.generate_single(query)
            _, faiss_indices = self.faiss_store.search(query_embedding, k=k_faiss)
            
            # Merge candidates (remove duplicates)
            candidates = []
            seen = set()
            
            for idx in list(bm25_indices) + list(faiss_indices):
                if idx not in seen and idx < len(self.df):
                    candidates.append(idx)
                    seen.add(idx)
            
            # Rerank by cosine similarity
            if len(candidates) == 0:
                return []
            
            candidate_embeddings = self.embeddings[candidates]
            similarities = (candidate_embeddings @ query_embedding).reshape(-1)
            
            # Sort by similarity
            ranked_pairs = sorted(
                zip(candidates, similarities),
                key=lambda x: x[1],
                reverse=True
            )[:top_k]
            
            # Format results
            results = []
            for idx, score in ranked_pairs:
                row = self.df.iloc[idx]
                results.append({
                    "idx": int(idx),
                    "score": float(score),
                    "verse": row['verse_number'],
                    "text": row['combined_en'][:500],
                    "sanskrit": row['verse_in_sanskrit'][:200],
                    "translation": row['translation_in_english'][:300],
                    "hindi_translation": row['translation_in_hindi'][:300] if not pd.isna(row['translation_in_hindi']) else "N/A",
                    "hindi_meaning": row['meaning_in_hindi'][:500] if not pd.isna(row['meaning_in_hindi']) else "N/A"
                })
            
            log.info(f"Retrieved {len(results)} results for query: {query[:50]}...")
            return results
            
        except Exception as e:
            log.error(f"Error in hybrid retrieval: {e}")
            return []
