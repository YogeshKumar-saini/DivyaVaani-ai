"""Build pipeline for creating all artifacts from comprehensive spiritual texts."""

import numpy as np
import pandas as pd
from pathlib import Path
from src.config import settings
from src.data.loader import ComprehensiveDataLoader
from src.embeddings import EmbeddingGenerator
from src.vectorstore import FAISSStore, ChromaStore, BM25Store
from src.utils.logger import log


class BuildPipeline:
    """Pipeline to build all artifacts from comprehensive spiritual text data."""

    def __init__(self):
        self.settings = settings
        self.settings.ensure_directories()

        # Use comprehensive data loader for all files
        self.data_loader = ComprehensiveDataLoader()
        self.embedding_generator = EmbeddingGenerator(self.settings.embedding_model, self.settings.use_api_embeddings)
        self.faiss_store = FAISSStore(self.settings.faiss_index_path)
        self.chroma_store = ChromaStore(self.settings.chroma_persist_dir, "verses")
        self.bm25_store = BM25Store(str(self.settings.artifact_path / "bm25.pkl"))

        self.df = None
        self.embeddings = None

    def run(self):
        """Run the complete build pipeline."""
        log.info("=" * 60)
        log.info("Starting Comprehensive Build Pipeline")
        log.info("=" * 60)

        # Step 1: Load all data from all files
        log.info("\n[Step 1/6] Loading comprehensive data from all files...")
        self.df = self.data_loader.load_all_data()

        # Step 2: Generate embeddings
        log.info("\n[Step 2/6] Generating embeddings...")
        texts = self.df['content'].tolist()
        log.info(f"Processing {len(texts)} text segments from {len(self.df)} total entries")

        # Filter out empty texts
        valid_texts = []
        valid_indices = []
        for i, text in enumerate(texts):
            if text and len(text.strip()) > 10:  # Only keep substantial content
                valid_texts.append(text.strip())
                valid_indices.append(i)

        log.info(f"Found {len(valid_texts)} valid text segments for embedding")

        if not valid_texts:
            raise ValueError("No valid text content found for embedding")

        self.embeddings = self.embedding_generator.generate(valid_texts)

        # Filter dataframe to match valid embeddings
        self.df = self.df.iloc[valid_indices].reset_index(drop=True)

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
        self.bm25_store.create_index(valid_texts)
        self.bm25_store.save()

        # Step 5: Create ChromaDB collection
        log.info("\n[Step 5/6] Creating ChromaDB collection...")
        self.chroma_store.initialize()

        documents = valid_texts
        metadatas = self.df[['source_file', 'file_type', 'language', 'title']].to_dict(orient='records')
        ids = [str(i) for i in range(len(documents))]

        self.chroma_store.add_documents(documents, metadatas, ids)

        # Step 6: Save processed dataframe
        log.info("\n[Step 6/6] Saving processed dataframe...")
        df_path = self.settings.artifact_path / "verses.parquet"
        self.df.to_parquet(df_path, index=False)
        log.info(f"Dataframe saved to {df_path}")

        log.info("\n" + "=" * 60)
        log.info("Comprehensive Build Pipeline Completed Successfully!")
        log.info("=" * 60)
        log.info(f"\nArtifacts saved in: {self.settings.artifact_path}")
        log.info(f"Total text segments processed: {len(self.df)}")
        log.info(f"Files processed: {self.df['source_file'].nunique()}")
        log.info(f"Content languages: {', '.join(self.df['language'].unique())}")
        log.info(f"Embedding dimension: {self.embeddings.shape[1]}")

        # Show file breakdown
        file_counts = self.df.groupby(['file_type', 'source_file']).size().reset_index(name='count')
        log.info("\nFile Processing Summary:")
        for _, row in file_counts.iterrows():
            log.info(f"  {row['file_type'].upper()}: {row['source_file']} ({row['count']} segments)")


def main():
    """Main entry point for build pipeline."""
    pipeline = BuildPipeline()
    pipeline.run()


if __name__ == "__main__":
    main()
