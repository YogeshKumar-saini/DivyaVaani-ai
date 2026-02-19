# RAG System: Retrieval & Embeddings

DivyaVaani's retrieval layer ensures that every answer is grounded in authentic spiritual wisdom by performing high-speed semantic searches over millions of scripture verses.

## 1. Embedding Generation

The system converts both original scripture verses and user queries into dense numerical vectors (embeddings).

- **Model**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Capability**: This model is natively multilingual, allowing a query in Hindi to retrieve relevant verses even if they were originally indexed with English metadata.
- **Dimensionality**: 384 dimensions.

## 2. Pinecone Vector Database

The processed embeddings are stored and searched in **Pinecone**, a low-latency vector database.

- **Index Name**: `divyavaani-verses`
- **Metric**: Cosine Similarity.
- **Top-K Retrieval**: By default, the system retrieves the **top 7** most relevant spiritual segments for every query to provide a broad yet focused context.

## 3. Knowledge Ingestion

The system includes a `ComprehensiveDataLoader` that can ingest wisdom from various file formats into the RAG pipeline:

- **Supported Formats**: `.pdf`, `.txt`, `.csv`, `.xlsx`, `.docx`.
- **Processing**:
  1. **Partitioning**: Documents are split into semantic chunks (verses or paragraphs).
  2. **Metadata Tagging**: Each chunk is tagged with its source text, language, and spiritual tradition.
  3. **Indexing**: Chunks are embedded and upserted to Pinecone in batches.

## 4. API: Document Management
`POST /documents/upload`

Enables administrators to add new spiritual texts to the DivyaVaani knowledge base.

- **RequestBody**:
  - `file`: binary (PDF, TXT, etc.)
  - `language`: string (Optional)
  - `metadata`: JSON-string (Optional)

- **Response**:
```json
{
  "success": true,
  "file_id": "bhagavad-gita.pdf",
  "chunks_processed": 700,
  "message": "Successfully indexed verses into Pinecone"
}
```
