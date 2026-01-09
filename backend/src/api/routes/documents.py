"""Document management API routes for RAG system."""

import shutil
import tempfile
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel

from src.config import settings
from src.utils.logger import log, structured_logger
from src.data.loader import ComprehensiveDataLoader
from src.embeddings import EmbeddingGenerator
from src.retrieval import PineconeRetriever

router = APIRouter(tags=["documents"])

class UploadResponse(BaseModel):
    success: bool
    file_id: str
    message: str
    chunks_processed: int
    vector_ids: List[str]

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None)
):
    """Upload and process a document for the RAG system."""
    start_time = time.time()
    
    # Validation
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
        
    allowed_extensions = {'.pdf', '.txt', '.csv', '.xlsx', '.docx'}
    file_path = Path(file.filename)
    if file_path.suffix.lower() not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}")

    try:
        # Create temporary file to process
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_path.suffix) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = Path(tmp_file.name)
            
        try:
            log.info(f"Processing uploaded file: {file.filename}")
            
            # 1. Load and parse content
            loader = ComprehensiveDataLoader()
            # We use the temp path but want to keep original filename in metadata
            documents = loader.load_file(tmp_path)
            
            if not documents:
                raise HTTPException(status_code=400, detail="Could not extract text from file")
                
            # Update metadata with original filename and provided details
            for doc in documents:
                doc['source_file'] = file.filename
                if language:
                    doc['language'] = language
                if user_id:
                    doc['user_id'] = user_id
                
                # Ensure ID exists
                if 'id' not in doc:
                    doc['id'] = f"{file.filename}_{int(time.time())}_{documents.index(doc)}"

            log.info(f"Extracted {len(documents)} text segments from {file.filename}")

            # 2. Generate embeddings
            embedding_gen = EmbeddingGenerator(settings.embedding_model, use_api=False)
            texts = [doc['content'] for doc in documents]
            
            embeddings = embedding_gen.generate(texts)
            log.info(f"Generated embeddings with shape {embeddings.shape}")

            # 3. Upsert to Pinecone
            retriever = PineconeRetriever(
                index_name="divyavaani-verses",
                model_name=settings.embedding_model
            )
            
            upsert_count = retriever.upsert_documents(documents, embeddings)
            
            process_time = time.time() - start_time
            
            # Log success
            structured_logger.log_request(
                method="POST",
                path="/upload",
                status_code=200,
                duration=process_time,
                metadata={"file": file.filename, "chunks": upsert_count}
            )
            
            return {
                "success": True,
                "file_id": file.filename,
                "message": f"Successfully processed {file.filename}",
                "chunks_processed": upsert_count,
                "vector_ids": [doc['id'] for doc in documents],
                "file_size": tmp_path.stat().st_size,
                "file_type": file.content_type
            }
            
        finally:
            # Cleanup temp file
            if tmp_path.exists():
                tmp_path.unlink()
                
    except Exception as e:
        log.error(f"Upload processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
