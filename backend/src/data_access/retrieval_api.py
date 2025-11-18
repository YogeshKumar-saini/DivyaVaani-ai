"""Retrieval API for vector similarity search."""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

from src.embeddings import EmbeddingService
from src.vectorstore import FAISSStore, BM25Store
from src.utils.logger import log


@dataclass
class SearchResult:
    """Search result with document and score."""
    document_id: str
    collection: str
    content: str
    metadata: Dict[str, Any]
    score: float
    rank: int


class RetrievalAPI:
    """API for vector similarity search across collections."""
    
    def __init__(
        self,
        artifact_dir: Path,
        embedding_service: Optional[EmbeddingService] = None
    ):
        """Initialize retrieval API.
        
        Args:
            artifact_dir: Base directory for artifacts
            embedding_service: Optional embedding service for query encoding
        """
        self.artifact_dir = Path(artifact_dir)
        self.embedding_service = embedding_service
        self._collection_cache = {}
    
    def search(
        self,
        query: str,
        collections: List[str],
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Search across collections using vector similarity.
        
        Args:
            query: Search query
            collections: List of collection names to search
            top_k: Number of results to return
            filters: Optional metadata filters
            
        Returns:
            List of SearchResult objects
        """
        all_results = []
        
        for collection_name in collections:
            try:
                results = self._search_collection(
                    query=query,
                    collection_name=collection_name,
                    top_k=top_k,
                    filters=filters
                )
                all_results.extend(results)
            except Exception as e:
                log.error(f"Error searching collection {collection_name}: {e}")
        
        # Sort by score and limit
        all_results.sort(key=lambda x: x.score, reverse=True)
        all_results = all_results[:top_k]
        
        # Update ranks
        for i, result in enumerate(all_results, 1):
            result.rank = i
        
        return all_results
    
    def hybrid_search(
        self,
        query: str,
        collections: List[str],
        top_k: int = 10,
        vector_weight: float = 0.7,
        bm25_weight: float = 0.3
    ) -> List[SearchResult]:
        """Hybrid search combining vector and BM25.
        
        Args:
            query: Search query
            collections: List of collection names to search
            top_k: Number of results to return
            vector_weight: Weight for vector similarity scores
            bm25_weight: Weight for BM25 scores
            
        Returns:
            List of SearchResult objects
        """
        all_results = []
        
        for collection_name in collections:
            try:
                # Get vector results
                vector_results = self._search_collection(
                    query=query,
                    collection_name=collection_name,
                    top_k=top_k * 2  # Get more for reranking
                )
                
                # Get BM25 results
                bm25_results = self._bm25_search_collection(
                    query=query,
                    collection_name=collection_name,
                    top_k=top_k * 2
                )
                
                # Combine scores
                combined = self._combine_results(
                    vector_results,
                    bm25_results,
                    vector_weight,
                    bm25_weight
                )
                
                all_results.extend(combined)
                
            except Exception as e:
                log.error(f"Error in hybrid search for {collection_name}: {e}")
        
        # Sort by combined score and limit
        all_results.sort(key=lambda x: x.score, reverse=True)
        all_results = all_results[:top_k]
        
        # Update ranks
        for i, result in enumerate(all_results, 1):
            result.rank = i
        
        return all_results
    
    def _search_collection(
        self,
        query: str,
        collection_name: str,
        top_k: int,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Search a single collection using FAISS.
        
        Args:
            query: Search query
            collection_name: Collection name
            top_k: Number of results
            filters: Optional filters
            
        Returns:
            List of SearchResult objects
        """
        collection_dir = self.artifact_dir / collection_name
        
        # Load FAISS index
        faiss_path = collection_dir / "faiss.index"
        if not faiss_path.exists():
            log.warning(f"FAISS index not found for {collection_name}")
            return []
        
        faiss_store = FAISSStore(str(faiss_path))
        faiss_store.load()
        
        # Load documents
        df_path = collection_dir / "documents.parquet"
        if not df_path.exists():
            log.warning(f"Documents not found for {collection_name}")
            return []
        
        df = pd.read_parquet(df_path)
        
        # Generate query embedding
        if not self.embedding_service:
            log.error("Embedding service not initialized")
            return []
        
        query_embedding = self.embedding_service.generate_single(query)
        
        # Search
        indices, distances = faiss_store.search(query_embedding, top_k)
        
        # Create results
        results = []
        for idx, distance in zip(indices, distances):
            if idx >= len(df):
                continue
            
            row = df.iloc[idx]
            
            # Extract metadata
            metadata = {}
            for col in df.columns:
                if col not in ['id', 'collection', 'content']:
                    metadata[col] = row[col]
            
            # Apply filters
            if filters:
                skip = False
                for key, value in filters.items():
                    if key in metadata and metadata[key] != value:
                        skip = True
                        break
                if skip:
                    continue
            
            result = SearchResult(
                document_id=row.get('id', ''),
                collection=collection_name,
                content=row.get('content', ''),
                metadata=metadata,
                score=float(1.0 / (1.0 + distance)),  # Convert distance to similarity
                rank=0  # Will be set later
            )
            results.append(result)
        
        return results
    
    def _bm25_search_collection(
        self,
        query: str,
        collection_name: str,
        top_k: int
    ) -> List[SearchResult]:
        """Search a single collection using BM25.
        
        Args:
            query: Search query
            collection_name: Collection name
            top_k: Number of results
            
        Returns:
            List of SearchResult objects
        """
        collection_dir = self.artifact_dir / collection_name
        
        # Load BM25 index
        bm25_path = collection_dir / "bm25.pkl"
        if not bm25_path.exists():
            log.warning(f"BM25 index not found for {collection_name}")
            return []
        
        bm25_store = BM25Store(str(bm25_path))
        bm25_store.load()
        
        # Load documents
        df_path = collection_dir / "documents.parquet"
        if not df_path.exists():
            return []
        
        df = pd.read_parquet(df_path)
        
        # Search
        indices, scores = bm25_store.search(query, top_k)
        
        # Create results
        results = []
        for idx, score in zip(indices, scores):
            if idx >= len(df):
                continue
            
            row = df.iloc[idx]
            
            metadata = {}
            for col in df.columns:
                if col not in ['id', 'collection', 'content']:
                    metadata[col] = row[col]
            
            result = SearchResult(
                document_id=row.get('id', ''),
                collection=collection_name,
                content=row.get('content', ''),
                metadata=metadata,
                score=float(score),
                rank=0
            )
            results.append(result)
        
        return results
    
    def _combine_results(
        self,
        vector_results: List[SearchResult],
        bm25_results: List[SearchResult],
        vector_weight: float,
        bm25_weight: float
    ) -> List[SearchResult]:
        """Combine vector and BM25 results.
        
        Args:
            vector_results: Results from vector search
            bm25_results: Results from BM25 search
            vector_weight: Weight for vector scores
            bm25_weight: Weight for BM25 scores
            
        Returns:
            Combined results
        """
        # Create score maps
        vector_scores = {r.document_id: r.score for r in vector_results}
        bm25_scores = {r.document_id: r.score for r in bm25_results}
        
        # Normalize scores
        if vector_scores:
            max_vector = max(vector_scores.values())
            vector_scores = {k: v / max_vector for k, v in vector_scores.items()}
        
        if bm25_scores:
            max_bm25 = max(bm25_scores.values())
            bm25_scores = {k: v / max_bm25 for k, v in bm25_scores.items()}
        
        # Combine
        all_doc_ids = set(vector_scores.keys()) | set(bm25_scores.keys())
        combined_scores = {}
        
        for doc_id in all_doc_ids:
            v_score = vector_scores.get(doc_id, 0.0)
            b_score = bm25_scores.get(doc_id, 0.0)
            combined_scores[doc_id] = (v_score * vector_weight) + (b_score * bm25_weight)
        
        # Create result objects with combined scores
        doc_map = {r.document_id: r for r in vector_results + bm25_results}
        
        combined_results = []
        for doc_id, score in combined_scores.items():
            if doc_id in doc_map:
                result = doc_map[doc_id]
                result.score = score
                combined_results.append(result)
        
        return combined_results
