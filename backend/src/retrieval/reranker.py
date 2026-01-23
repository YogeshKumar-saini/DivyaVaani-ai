"""Reranking module for improving context relevance using Cohere API."""

import os
from typing import List, Dict, Any, Optional
import cohere
from src.utils.logger import log


class CohereReranker:
    """Reranker using Cohere's rerank API for improved context relevance."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "rerank-english-v2.0"):
        """Initialize Cohere reranker.
        
        Args:
            api_key: Cohere API key (defaults to env var)
            model: Rerank model to use
        """
        self.api_key = api_key or os.getenv('COHERE_API_KEY')
        if not self.api_key:
            raise ValueError("Cohere API key not found")
        
        self.model = model
        self.client = cohere.Client(self.api_key)
        log.info(f"CohereReranker initialized with model: {model}")
    
    def rerank(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """Rerank documents using Cohere API.
        
        Args:
            query: Search query
            documents: List of document dicts with 'text' or 'content' field
            top_n: Number of top results to return
            
        Returns:
            Reranked documents with updated scores
        """
        if not documents:
            return []
        
        try:
            # Extract text from documents
            texts = []
            for doc in documents:
                text = doc.get('text') or doc.get('content', '')
                # Combine multiple fields for better reranking
                if doc.get('sanskrit'):
                    text = f"{doc['sanskrit']} {text}"
                if doc.get('translation'):
                    text = f"{text} {doc['translation']}"
                texts.append(text[:1000])  # Limit to 1000 chars per doc
            
            # Call Cohere rerank API
            log.info(f"Reranking {len(documents)} documents with query: {query[:50]}...")
            results = self.client.rerank(
                model=self.model,
                query=query,
                documents=texts,
                top_n=min(top_n, len(documents))
            )
            
            # Map results back to original documents
            reranked_docs = []
            for result in results.results:
                idx = result.index
                doc = documents[idx].copy()
                
                # Update score with rerank score
                doc['original_score'] = doc.get('score', 0)
                doc['rerank_score'] = result.relevance_score
                doc['score'] = result.relevance_score  # Use rerank score as primary
                
                reranked_docs.append(doc)
            
            log.info(f"Reranked to top {len(reranked_docs)} documents")
            return reranked_docs
            
        except Exception as e:
            log.error(f"Reranking failed: {e}. Returning original documents.")
            # Fallback: return top_n original documents
            return documents[:top_n]


class CrossEncoderReranker:
    """Local reranker using sentence-transformers cross-encoder (fallback)."""
    
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        """Initialize cross-encoder reranker.
        
        Args:
            model_name: HuggingFace model name
        """
        try:
            from sentence_transformers import CrossEncoder
            self.model = CrossEncoder(model_name)
            self.model_name = model_name
            log.info(f"CrossEncoderReranker initialized with model: {model_name}")
        except ImportError:
            raise ImportError("sentence-transformers not installed. Run: pip install sentence-transformers")
    
    def rerank(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """Rerank documents using cross-encoder.
        
        Args:
            query: Search query
            documents: List of document dicts
            top_n: Number of top results to return
            
        Returns:
            Reranked documents with updated scores
        """
        if not documents:
            return []
        
        try:
            # Prepare query-document pairs
            pairs = []
            for doc in documents:
                text = doc.get('text') or doc.get('content', '')
                pairs.append([query, text[:512]])  # Limit text length
            
            # Score pairs
            log.info(f"Reranking {len(documents)} documents with cross-encoder...")
            scores = self.model.predict(pairs)
            
            # Combine documents with scores
            scored_docs = []
            for doc, score in zip(documents, scores):
                doc_copy = doc.copy()
                doc_copy['original_score'] = doc.get('score', 0)
                doc_copy['rerank_score'] = float(score)
                doc_copy['score'] = float(score)
                scored_docs.append(doc_copy)
            
            # Sort by rerank score and return top_n
            scored_docs.sort(key=lambda x: x['rerank_score'], reverse=True)
            reranked = scored_docs[:top_n]
            
            log.info(f"Reranked to top {len(reranked)} documents")
            return reranked
            
        except Exception as e:
            log.error(f"Cross-encoder reranking failed: {e}")
            return documents[:top_n]


def create_reranker(use_cohere: bool = True) -> Any:
    """Factory function to create appropriate reranker.
    
    Args:
        use_cohere: Whether to use Cohere (True) or cross-encoder (False)
        
    Returns:
        Reranker instance
    """
    if use_cohere and os.getenv('COHERE_API_KEY'):
        try:
            return CohereReranker()
        except Exception as e:
            log.warning(f"Failed to initialize Cohere reranker: {e}. Falling back to cross-encoder.")
    
    # Fallback to cross-encoder
    try:
        return CrossEncoderReranker()
    except Exception as e:
        log.error(f"Failed to initialize any reranker: {e}")
        return None
