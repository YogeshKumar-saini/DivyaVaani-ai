"""ChromaDB vector store implementation."""

import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any
from pathlib import Path
from src.utils.logger import log


class ChromaStore:
    """ChromaDB vector store for document retrieval."""
    
    def __init__(self, persist_directory: str, collection_name: str = "verses"):
        self.persist_directory = Path(persist_directory)
        self.collection_name = collection_name
        self.client = None
        self.collection = None
    
    def initialize(self):
        """Initialize ChromaDB client and collection."""
        self.persist_directory.mkdir(exist_ok=True, parents=True)

        log.info(f"Initializing ChromaDB at {self.persist_directory}")
        self.client = chromadb.PersistentClient(path=str(self.persist_directory))

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name
        )
        log.info(f"ChromaDB collection '{self.collection_name}' initialized")
    
    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ):
        """Add documents to the collection."""
        if self.collection is None:
            self.initialize()
        
        # Check if collection is empty
        if self.collection.count() > 0:
            log.info("Collection already has documents, skipping addition")
            return
        
        log.info(f"Adding {len(documents)} documents to ChromaDB")
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        log.info("Documents added successfully")
    
    def query(
        self,
        query_text: str,
        n_results: int = 5
    ) -> Dict[str, Any]:
        """Query the collection."""
        if self.collection is None:
            self.initialize()
        
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results
    
    def persist(self):
        """Persist the collection to disk."""
        if self.client:
            log.info("Persisting ChromaDB collection")
