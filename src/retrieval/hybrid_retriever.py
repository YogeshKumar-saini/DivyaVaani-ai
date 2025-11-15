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

            # FAISS search - handle potential embedding generation failures
            try:
                query_embedding = self.embedding_generator.generate_single(query)
                _, faiss_indices = self.faiss_store.search(query_embedding, k=k_faiss)
            except Exception as e:
                log.warning(f"FAISS search failed: {e}, falling back to BM25 only")
                faiss_indices = []

            # Merge candidates (remove duplicates)
            candidates = []
            seen = set()

            for idx in list(bm25_indices) + list(faiss_indices):
                if idx not in seen and idx < len(self.df) and idx >= 0:
                    candidates.append(idx)
                    seen.add(idx)

            # If no candidates from search, return empty results
            if len(candidates) == 0:
                log.info(f"No candidates found for query: {query[:50]}...")
                return []

            # Rerank by cosine similarity if we have embeddings and query_embedding
            if self.embeddings is not None and 'query_embedding' in locals():
                try:
                    candidate_embeddings = self.embeddings[candidates]
                    similarities = (candidate_embeddings @ query_embedding).reshape(-1)

                    # Sort by similarity
                    ranked_pairs = sorted(
                        zip(candidates, similarities),
                        key=lambda x: x[1],
                        reverse=True
                    )[:top_k]
                except Exception as e:
                    log.warning(f"Similarity reranking failed: {e}, using BM25 order")
                    # Fall back to BM25 order if reranking fails
                    ranked_pairs = [(idx, 1.0) for idx in candidates[:top_k]]
            else:
                # No embeddings available, use BM25 order
                ranked_pairs = [(idx, 1.0) for idx in candidates[:top_k]]

            # Format results
            results = []
            for idx, score in ranked_pairs:
                try:
                    row = self.df.iloc[idx]
                    # Handle None values safely
                    verse_number = row.get('verse_number')
                    if verse_number is None:
                        verse_number = f"Verse {idx}"

                    content = row.get('content', '')
                    if content is None:
                        content = ''

                    sanskrit = row.get('verse_in_sanskrit', '')
                    if sanskrit is None:
                        sanskrit = ''

                    translation_en = row.get('translation_in_english')
                    if pd.isna(translation_en) or translation_en is None:
                        translation_en = "N/A"

                    translation_hi = row.get('translation_in_hindi')
                    if pd.isna(translation_hi) or translation_hi is None:
                        translation_hi = "N/A"

                    meaning_hi = row.get('meaning_in_hindi')
                    if pd.isna(meaning_hi) or meaning_hi is None:
                        meaning_hi = "N/A"

                    results.append({
                        "idx": int(idx),
                        "score": float(score),
                        "verse": str(verse_number),
                        "text": str(content)[:500],
                        "sanskrit": str(sanskrit)[:200],
                        "translation": str(translation_en)[:300],
                        "hindi_translation": str(translation_hi)[:300],
                        "hindi_meaning": str(meaning_hi)[:500]
                    })
                except Exception as e:
                    log.warning(f"Error formatting result for index {idx}: {e}")
                    continue

            log.info(f"Retrieved {len(results)} results for query: {query[:50]}...")
            return results

        except Exception as e:
            log.error(f"Error in hybrid retrieval: {e}")
            return []
