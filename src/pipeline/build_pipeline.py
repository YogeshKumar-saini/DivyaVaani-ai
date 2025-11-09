"""Build pipeline for creating all artifacts."""

import numpy as np
import pandas as pd
from pathlib import Path
from src.config import settings
from src.data import DataLoader
from src.embeddings import EmbeddingGenerator
from src.vectorstore import FAISSStore, ChromaStore, BM25Store
from src.utils.logger import log


class BuildPipeline:
    """Pipeline to build all artifacts."""
    
    def __init__(self):
        self.settings = settings
        self.settings.ensure_directories()
        
        self.data_loader = DataLoader(self.settings.data_path)
        self.embedding_generator = EmbeddingGenerator(self.settings.embedding_model)
        self.faiss_store = FAISSStore(self.settings.faiss_index_path)
        self.chroma_store = ChromaStore(self.settings.chroma_persist_dir)
        self.bm25_store = BM25Store(str(self.settings.artifact_path / "bm25.pkl"))
        
        self.df = None
        self.embeddings = None
    
    def run(self):
        """Run the complete build pipeline."""
        log.info("=" * 60)
        log.info("Starting Build Pipeline")
        log.info("=" * 60)
        
        # Step 1: Load data
        log.info("\n[Step 1/6] Loading data...")
        self.df = self.data_loader.load()
        
        # Step 2: Generate embeddings
        log.info("\n[Step 2/6] Generating embeddings...")
        texts = self.df['combined_en'].tolist()
        self.embeddings = self.embedding_generator.generate(texts)
        
        # Save embeddings
        embeddings_path = self.settings.artifact_path / "embeddings.npy"
        np.save(embeddings_path, self.embeddings)
        log.info(f"Embeddings saved to {embeddings_path}")
        
        # Step 3: Create FAISS index
        log.info("\n[Step 3/6] Creating FAISS index...")
        self.faiss_store.create_index(self.embeddings)
        self.faiss_store.save()
        
        # Step 4: Create BM25 index
        log.info("\n[Step 4/6] Creating BM25 index...")
        self.bm25_store.create_index(texts)
        self.bm25_store.save()
        
        # Step 5: Create ChromaDB collection
        log.info("\n[Step 5/6] Creating ChromaDB collection...")
        self.chroma_store.initialize()
        
        documents = self.df['combined_en'].tolist()
        metadatas = self.df[['verse_number', 'translation_in_english']].to_dict(orient='records')
        ids = [str(i) for i in range(len(documents))]
        
        self.chroma_store.add_documents(documents, metadatas, ids)
        
        # Step 6: Save processed dataframe
        log.info("\n[Step 6/6] Saving processed dataframe...")
        df_path = self.settings.artifact_path / "verses.parquet"
        self.df.to_parquet(df_path, index=False)
        log.info(f"Dataframe saved to {df_path}")
        
        log.info("\n" + "=" * 60)
        log.info("Build Pipeline Completed Successfully!")
        log.info("=" * 60)
        log.info(f"\nArtifacts saved in: {self.settings.artifact_path}")
        log.info(f"Total verses processed: {len(self.df)}")
        log.info(f"Embedding dimension: {self.embeddings.shape[1]}")


def main():
    """Main entry point for build pipeline."""
    pipeline = BuildPipeline()
    pipeline.run()


if __name__ == "__main__":
    main()
