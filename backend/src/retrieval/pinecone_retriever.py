"""Pinecone-based retriever for semantic search."""

import os
import time
from typing import List, Dict, Any, Optional
import numpy as np
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

from src.utils.logger import log, structured_logger


class PineconeRetriever:
    """Retriever using Pinecone cloud vector store."""
    
    def __init__(
        self,
        index_name: str = "divyavaani-verses",
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        api_key: Optional[str] = None
    ):
        """Initialize Pinecone retriever.
        
        Args:
            index_name: Name of Pinecone index
            model_name: Embedding model name
            api_key: Pinecone API key (defaults to env var)
        """
        self.index_name = index_name
        self.model_name = model_name
        
        # Initialize Pinecone
        api_key = api_key or os.getenv('PINECONE_API_KEY')
        if not api_key:
            raise ValueError("Pinecone API key not found")
        
        self.pc = Pinecone(api_key=api_key)
        self.index = None
        self.model = None
        
        log.info(f"PineconeRetriever initialized with index: {index_name}")
    
    def load_model(self):
        """Load embedding model."""
        if self.model is None:
            log.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            log.info("Embedding model loaded successfully")
    
    def connect(self):
        """Connect to Pinecone index."""
        try:
            self.index = self.pc.Index(self.index_name)
            stats = self.index.describe_index_stats()
            log.info(f"Connected to Pinecone index: {self.index_name}")
            log.info(f"Index stats - Total vectors: {stats.total_vector_count}, Dimension: {stats.dimension}")
            return True
        except Exception as e:
            log.error(f"Failed to connect to Pinecone: {e}")
            return False
    
    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant documents for a query.
        
        Args:
            query: Search query text
            top_k: Number of results to return
            filter_dict: Optional metadata filters
        
        Returns:
            List of retrieved documents with scores and metadata
        """
        start_time = time.time()
        
        try:
            # Ensure model is loaded
            if self.model is None:
                self.load_model()
            
            # Ensure connected to index
            if self.index is None:
                if not self.connect():
                    raise RuntimeError("Failed to connect to Pinecone")
            
            # Generate query embedding
            log.info(f"Generating embedding for query: {query[:50]}...")
            query_embedding = self.model.encode([query])[0].tolist()
            
            # Search Pinecone
            log.info(f"Searching Pinecone for top {top_k} results")
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            
            # Format results to match QA system expectations
            documents = []
            for match in results['matches']:
                metadata = match.get('metadata', {})
                
                # Format document with fields expected by QA system
                doc = {
                    'id': match['id'],
                    'score': match['score'],
                    'verse': metadata.get('title', f"Verse {match['id']}"),  # Use title as verse identifier
                    'text': metadata.get('content', ''),
                    'content': metadata.get('content', ''),
                    'chapter': metadata.get('source_file', '').replace('.csv', ''),
                    'sanskrit': metadata.get('sanskrit', ''),
                    'translation': metadata.get('translation', ''),
                    'hindi_translation': metadata.get('hindi_translation', ''),
                    'language': metadata.get('language', 'en'),
                    'file_type': metadata.get('file_type', 'csv'),
                    'source_file': metadata.get('source_file', '')
                }
                documents.append(doc)
            
            elapsed = time.time() - start_time
            log.info(f"Retrieved {len(documents)} documents in {elapsed:.2f}s")
            
            structured_logger.log_performance(
                operation="pinecone_retrieval",
                duration=elapsed,
                metadata={
                    "query_length": len(query),
                    "top_k": top_k,
                    "results_count": len(documents)
                }
            )
            
            return documents
            
        except Exception as e:
            log.error(f"Retrieval failed: {e}")
            structured_logger.log_error(e, {"operation": "pinecone_retrieval", "query": query[:100]})
            raise
            raise
    
    def upsert_documents(self, documents: List[Dict[str, Any]], embeddings: np.ndarray) -> int:
        """Upsert documents with embeddings to Pinecone.
        
        Args:
            documents: List of document dictionaries (metadata)
            embeddings: Numpy array of embeddings
            
        Returns:
            Number of vectors upserted
        """
        try:
            if self.index is None:
                if not self.connect():
                    raise RuntimeError("Failed to connect to Pinecone")
            
            # Prepare vectors
            vectors = []
            for i, doc in enumerate(documents):
                # Use a stable ID if available, otherwise generate one
                vector_id = doc.get('id', f"{int(time.time())}_{i}")
                
                # Filter metadata to simple types for Pinecone
                metadata = {
                    k: v for k, v in doc.items() 
                    if isinstance(v, (str, int, float, bool)) and k != 'id'
                }
                
                vectors.append({
                    'id': str(vector_id),
                    'values': embeddings[i].tolist(),
                    'metadata': metadata
                })
            
            # Upsert in batches
            count = 0
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i+batch_size]
                self.index.upsert(vectors=batch)
                count += len(batch)
                log.info(f"Upserted batch {i//batch_size + 1} ({len(batch)} vectors)")
                
            log.info(f"Successfully upserted {count} vectors to Pinecone")
            return count
            
        except Exception as e:
            log.error(f"Upsert failed: {e}")
            raise
        """Check Pinecone connection health.
        
        Returns:
            Health status dictionary
        """
        try:
            if self.index is None:
                self.connect()
            
            stats = self.index.describe_index_stats()
            
            return {
                "status": "healthy",
                "index_name": self.index_name,
                "total_vectors": stats.total_vector_count,
                "dimension": stats.dimension
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
