"""Embedding generation using API-based services or local models with multimodal support."""

import numpy as np
from typing import List, Optional, Dict, Any, Union
import requests
import asyncio
import time
from sklearn.preprocessing import normalize
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from src.utils.logger import log, structured_logger
from src.config import settings
from src.pipeline.models import StructuredContent, Document


class EmbeddingGenerator:
    """Generate embeddings for text using API services or local models."""

    def __init__(self, model_name: str, use_api: bool = True, enable_cache: bool = True):
        self.model_name = model_name
        self.use_api = use_api
        self.enable_cache = enable_cache
        self.api_key = self._get_api_key()
        self.model = None

        # Initialize cache if enabled
        if self.enable_cache:
            try:
                from src.embeddings.distributed_cache import get_cache_instance
                self.cache = get_cache_instance()
                log.info("Embedding cache enabled")
            except Exception as e:
                log.warning(f"Cache initialization failed: {e}, disabling cache")
                self.enable_cache = False
                self.cache = None
        else:
            self.cache = None

    def _get_api_key(self) -> Optional[str]:
        """Get API key based on configured model."""
        if "openai" in self.model_name.lower() or "text-embedding" in self.model_name.lower():
            return settings.openai_api_key
        elif "cohere" in self.model_name.lower() or "embed-multilingual" in self.model_name.lower():
            return settings.cohere_api_key
        # Add other API providers as needed
        return None

    def load_model(self):
        """Load the embedding model (only for local models)."""
        if not self.use_api and self.model is None:
            try:
                # Check for advanced multimodal models first
                if "gme-Qwen2-VL" in self.model_name or "Qwen2-VL" in self.model_name:
                    # Alibaba-NLP/gme-Qwen2-VL-2B-Instruct - Multimodal Vision-Language Model
                    try:
                        self._load_qwen_vl_model()
                    except Exception as e:
                        log.warning(f"Failed to load Qwen2-VL model due to protobuf compatibility: {e}, falling back to API")
                        self.use_api = True
                        self.model = None
                elif "e5-v" in self.model_name:
                    # royokong/e5-v - Image-to-Text model
                    self._load_e5_v_model()
                elif "VLM2Vec" in self.model_name:
                    # TIGER-Lab/VLM2Vec-LoRA - Vision-Language model
                    self._load_vlm2vec_model()
                elif "MM-Embed" in self.model_name:
                    # nvidia/MM-Embed - Multimodal embedding model
                    self._load_mm_embed_model()
                elif "CaRe-7B" in self.model_name:
                    # MCG-NJU/CaRe-7B - Multimodal model
                    self._load_care_model()
                elif "UniME" in self.model_name:
                    # DeepGlint-AI/UniME models - Multimodal models
                    self._load_unime_model()
                elif "BGE-VL" in self.model_name:
                    # BAAI/BGE-VL-base - Vision-Language model
                    self._load_bge_vl_model()
                else:
                    # Try sentence-transformers first for traditional models
                    from sentence_transformers import SentenceTransformer
                    log.info(f"Loading sentence-transformers model: {self.model_name}")
                    self.model = SentenceTransformer(self.model_name, device='cpu')
                    log.info("Sentence-transformers model loaded successfully")
            except Exception as e:
                log.warning(f"Primary model loading failed: {e}, trying direct transformers")
                try:
                    # Fallback to direct transformers
                    from transformers import AutoTokenizer, AutoModel
                    import torch
                    log.info(f"Loading transformers model: {self.model_name}")
                    self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                    self.model = AutoModel.from_pretrained(self.model_name)
                    self.model.eval()  # Set to evaluation mode
                    log.info("Transformers model loaded successfully")
                except Exception as e2:
                    log.error(f"All model loading attempts failed: {e2}, falling back to API")
                    self.use_api = True
                    self.model = None
                    self.tokenizer = None

    def generate(
        self,
        texts: List[str],
        batch_size: int = 64,
        normalize_embeddings: bool = True
    ) -> np.ndarray:
        """Generate embeddings for a list of texts."""
        if self.use_api:
            return self._generate_api_embeddings(texts, normalize_embeddings)
        else:
            return self._generate_local_embeddings(texts, batch_size, normalize_embeddings)

    def _generate_api_embeddings(self, texts: List[str], normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using API services."""
        if "openai" in self.model_name.lower() or "text-embedding" in self.model_name.lower():
            return self._openai_embeddings(texts, normalize_embeddings)
        elif "cohere" in self.model_name.lower() or "embed-multilingual" in self.model_name.lower():
            return self._cohere_embeddings(texts, normalize_embeddings)
        else:
            log.warning(f"Unsupported API model: {self.model_name}, falling back to local")
            self.use_api = False
            self.load_model()
            return self._generate_local_embeddings(texts, 64, normalize_embeddings)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((requests.exceptions.RequestException, requests.exceptions.Timeout)),
        reraise=True
    )
    def _openai_embeddings(self, texts: List[str], normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using OpenAI API with retry logic."""
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")

        # Validate inputs
        if not texts or not all(isinstance(t, str) and t.strip() for t in texts):
            raise ValueError("Invalid input: texts must be non-empty strings")

        start_time = time.time()
        embeddings = []

        try:
            # Process in batches to avoid rate limits
            batch_size = min(100, len(texts))  # OpenAI allows up to 100 texts per request

            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]

                response = requests.post(
                    "https://api.openai.com/v1/embeddings",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "input": batch_texts,
                        "model": self.model_name
                    },
                    timeout=30  # 30 second timeout
                )
                response.raise_for_status()

                # Validate response structure
                response_data = response.json()
                if "data" not in response_data:
                    raise ValueError(f"Invalid API response: missing 'data' field")

                batch_embeddings = [item["embedding"] for item in response_data["data"]]
                embeddings.extend(batch_embeddings)

                # Rate limiting: small delay between batches
                if i + batch_size < len(texts):
                    time.sleep(0.1)

            embeddings_array = np.array(embeddings)

            # Validate embedding dimensions
            if embeddings_array.shape[1] not in [1536, 3072]:  # Expected dimensions for OpenAI models
                log.warning(f"Unexpected embedding dimension: {embeddings_array.shape[1]}")

            if normalize_embeddings:
                embeddings_array = normalize(embeddings_array)

            processing_time = time.time() - start_time
            log.info(f"Generated OpenAI embeddings with shape: {embeddings_array.shape} in {processing_time:.2f}s")

            # Log performance metrics
            structured_logger.log_performance(
                operation="openai_embedding_generation",
                duration=processing_time,
                metadata={
                    "text_count": len(texts),
                    "batch_size": batch_size,
                    "model": self.model_name
                }
            )

            return embeddings_array

        except requests.exceptions.Timeout:
            structured_logger.log_error(
                Exception("OpenAI API timeout"),
                {"operation": "openai_embedding_generation", "timeout": 30}
            )
            raise
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                log.warning("OpenAI API rate limit exceeded, will retry")
                raise  # Let tenacity handle retry
            elif response.status_code == 401:
                raise ValueError("Invalid OpenAI API key")
            elif response.status_code == 400:
                raise ValueError(f"Invalid request to OpenAI API: {response.text}")
            else:
                log.error(f"OpenAI API HTTP error {response.status_code}: {response.text}")
                raise
        except Exception as e:
            structured_logger.log_error(e, {"operation": "openai_embedding_generation"})
            raise

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((requests.exceptions.RequestException, requests.exceptions.Timeout)),
        reraise=True
    )
    def _cohere_embeddings(self, texts: List[str], normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using Cohere API with retry logic and batching."""
        if not self.api_key:
            raise ValueError("Cohere API key not configured")

        # Validate inputs
        if not texts or not all(isinstance(t, str) and t.strip() for t in texts):
            raise ValueError("Invalid input: texts must be non-empty strings")

        start_time = time.time()
        embeddings = []

        try:
            # Cohere allows max 96 texts per request
            batch_size = min(96, len(texts))

            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]

                response = requests.post(
                    "https://api.cohere.ai/v1/embed",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "texts": batch_texts,
                        "model": self.model_name,
                        "input_type": "search_document"
                    },
                    timeout=30  # 30 second timeout
                )
                response.raise_for_status()

                # Validate response structure
                response_data = response.json()
                if "embeddings" not in response_data:
                    raise ValueError(f"Invalid API response: missing 'embeddings' field")

                batch_embeddings = response_data["embeddings"]
                embeddings.extend(batch_embeddings)

                # Rate limiting: small delay between batches
                if i + batch_size < len(texts):
                    time.sleep(0.1)

            embeddings_array = np.array(embeddings)

            # Validate embedding dimensions (Cohere embeddings are typically 4096-dimensional)
            if embeddings_array.shape[1] not in [768, 1024, 4096]:  # Common Cohere dimensions
                log.warning(f"Unexpected embedding dimension: {embeddings_array.shape[1]}")

            if normalize_embeddings:
                embeddings_array = normalize(embeddings_array)

            processing_time = time.time() - start_time
            log.info(f"Generated Cohere embeddings with shape: {embeddings_array.shape} in {processing_time:.2f}s")

            # Log performance metrics
            structured_logger.log_performance(
                operation="cohere_embedding_generation",
                duration=processing_time,
                metadata={
                    "text_count": len(texts),
                    "batch_size": batch_size,
                    "batches": len(range(0, len(texts), batch_size)),
                    "model": self.model_name
                }
            )

            return embeddings_array

        except requests.exceptions.Timeout:
            structured_logger.log_error(
                Exception("Cohere API timeout"),
                {"operation": "cohere_embedding_generation", "timeout": 30}
            )
            raise
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                log.warning("Cohere API rate limit exceeded, will retry")
                raise  # Let tenacity handle retry
            elif response.status_code == 401:
                raise ValueError("Invalid Cohere API key")
            elif response.status_code == 400:
                raise ValueError(f"Invalid request to Cohere API: {response.text}")
            else:
                log.error(f"Cohere API HTTP error {response.status_code}: {response.text}")
                raise
        except Exception as e:
            structured_logger.log_error(e, {"operation": "cohere_embedding_generation"})
            raise

    def _generate_local_embeddings(self, texts: List[str], batch_size: int = 64, normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using local models (sentence-transformers, transformers, or multimodal models)."""
        self.load_model()

        log.info(f"Generating local embeddings for {len(texts)} texts")

        # Check for advanced multimodal models first
        if "gme-Qwen2-VL" in self.model_name or "Qwen2-VL" in self.model_name:
            return self._generate_qwen_vl_embeddings(texts, batch_size, normalize_embeddings)
        elif "e5-v" in self.model_name:
            return self._generate_e5_v_embeddings(texts, batch_size, normalize_embeddings)
        elif "VLM2Vec" in self.model_name:
            return self._generate_vlm2vec_embeddings(texts, batch_size, normalize_embeddings)
        elif "MM-Embed" in self.model_name:
            return self._generate_mm_embed_embeddings(texts, batch_size, normalize_embeddings)
        elif "CaRe" in self.model_name:
            return self._generate_care_embeddings(texts, batch_size, normalize_embeddings)
        elif "UniME" in self.model_name:
            return self._generate_unime_embeddings(texts, batch_size, normalize_embeddings)
        elif "BGE-VL" in self.model_name:
            return self._generate_bge_vl_embeddings(texts, batch_size, normalize_embeddings)
        # Check if we have sentence-transformers model
        elif hasattr(self, 'model') and hasattr(self.model, 'encode'):
            # Using sentence-transformers
            embeddings = self.model.encode(
                texts,
                show_progress_bar=True,
                convert_to_numpy=True,
                batch_size=batch_size
            )
        elif hasattr(self, 'model') and hasattr(self, 'tokenizer'):
            # Using direct transformers
            import torch
            embeddings = []

            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]

                # Tokenize
                inputs = self.tokenizer(batch_texts, return_tensors='pt', padding=True, truncation=True, max_length=512)

                # Generate embeddings
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    # Use mean pooling over token embeddings
                    batch_embeddings = outputs.last_hidden_state.mean(dim=1).numpy()

                embeddings.extend(batch_embeddings)

            embeddings = np.array(embeddings)
        else:
            raise ValueError("No valid embedding model loaded")

        if normalize_embeddings:
            embeddings = normalize(embeddings)

        log.info(f"Generated local embeddings with shape: {embeddings.shape}")
        return embeddings

    def generate_single(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        # Check cache first
        if self.enable_cache and self.cache:
            cache_key = f"embedding:{self.model_name}:{hash(text)}"
            cached_result = self.cache.get(cache_key)
            if cached_result is not None:
                log.debug("Cache hit for embedding")
                return cached_result

        # Generate embedding
        if self.use_api:
            embeddings = self.generate([text])
            result = embeddings[0]
        else:
            self.load_model()
            embedding = self.model.encode(text, convert_to_numpy=True)
            result = embedding / np.linalg.norm(embedding)

        # Cache result
        if self.enable_cache and self.cache:
            cache_key = f"embedding:{self.model_name}:{hash(text)}"
            self.cache.set(cache_key, result, ttl=3600)  # Cache for 1 hour

        return result

    def generate_structured(
        self,
        structured_content: StructuredContent,
        weights: Optional[Dict[str, float]] = None,
        use_clip: bool = False
    ) -> np.ndarray:
        """Generate multimodal embedding for structured content.

        Args:
            structured_content: StructuredContent object with text, tables, images
            weights: Optional weights for different modalities
            use_clip: Whether to use CLIP for image embeddings

        Returns:
            Combined multimodal embedding
        """
        if weights is None:
            # Dynamic weighting based on content availability
            weights = self._calculate_dynamic_weights(structured_content)

        embeddings = []
        embedding_weights = []

        # Generate text embedding
        if structured_content.text and structured_content.text.strip():
            text_embedding = self.generate_single(structured_content.text)
            embeddings.append(text_embedding)
            embedding_weights.append(weights.get('text', 0.5))

        # Generate table embeddings with enhanced processing
        if structured_content.tables:
            table_embedding = self._generate_table_embedding(structured_content.tables)
            if table_embedding is not None:
                embeddings.append(table_embedding)
                embedding_weights.append(weights.get('tables', 0.3))

        # Generate image embeddings
        if structured_content.images:
            image_embedding = self._generate_image_embedding(structured_content.images, use_clip)
            if image_embedding is not None:
                embeddings.append(image_embedding)
                embedding_weights.append(weights.get('images', 0.2))

        # Generate code block embeddings
        if structured_content.code_blocks:
            code_embedding = self._generate_code_embedding(structured_content.code_blocks)
            if code_embedding is not None:
                embeddings.append(code_embedding)
                embedding_weights.append(weights.get('code', 0.1))

        # Combine embeddings using advanced fusion
        if not embeddings:
            # Fallback: return zero embedding
            return np.zeros(self._get_embedding_dimension())

        if len(embeddings) == 1:
            return embeddings[0]

        # Use attention-based fusion for better multimodal combination
        combined_embedding = self._fuse_embeddings(embeddings, embedding_weights)

        return combined_embedding

    def _calculate_dynamic_weights(self, structured_content: StructuredContent) -> Dict[str, float]:
        """Calculate dynamic weights based on content availability and quality.

        Args:
            structured_content: The structured content to analyze

        Returns:
            Dictionary of weights for different modalities
        """
        weights = {}

        # Base weights
        has_text = bool(structured_content.text and structured_content.text.strip())
        has_tables = bool(structured_content.tables)
        has_images = bool(structured_content.images)
        has_code = bool(structured_content.code_blocks)

        total_modalities = sum([has_text, has_tables, has_images, has_code])

        if total_modalities == 0:
            return {'text': 1.0, 'tables': 0.0, 'images': 0.0, 'code': 0.0}

        # Dynamic weighting based on content richness
        if has_text:
            text_length = len(structured_content.text)
            # More weight for longer, richer text
            text_weight = min(0.8, 0.4 + (text_length / 1000) * 0.4)
            weights['text'] = text_weight

        if has_tables:
            # Weight based on number and complexity of tables
            num_tables = len(structured_content.tables)
            table_complexity = sum(len(table.get('rows', [])) for table in structured_content.tables)
            table_weight = min(0.4, 0.1 + (num_tables * 0.1) + (table_complexity / 100) * 0.1)
            weights['tables'] = table_weight

        if has_images:
            # Weight based on number of images
            num_images = len(structured_content.images)
            image_weight = min(0.3, 0.05 + (num_images * 0.1))
            weights['images'] = image_weight

        if has_code:
            # Code gets consistent weight
            weights['code'] = 0.2

        # Normalize weights to sum to 1.0
        total_weight = sum(weights.values())
        if total_weight > 0:
            weights = {k: v / total_weight for k, v in weights.items()}

        return weights

    def _generate_table_embedding(self, tables: List[Dict[str, Any]]) -> Optional[np.ndarray]:
        """Generate embedding for table content with advanced structural awareness.

        Args:
            tables: List of table dictionaries

        Returns:
            Combined table embedding or None
        """
        if not tables:
            return None

        try:
            from src.pipeline.processors.table_processor import AdvancedTableProcessor

            # Initialize table processor
            table_processor = AdvancedTableProcessor()

            table_embeddings = []

            for table in tables:
                # Process table with advanced analysis
                if 'rows' in table and table['rows']:
                    # Convert table dict to list format for processing
                    table_data = [table.get('headers', [])] + table['rows'] if table.get('headers') else table['rows']
                    analysis = table_processor.process_table(table_data)

                    # Generate rich text representation from analysis
                    representations = []

                    # Basic structure info
                    structure = analysis.structure
                    representations.append(f"Table Type: {analysis.semantic_type}")
                    representations.append(f"Shape: {structure.metadata['shape'][0]} rows × {structure.metadata['shape'][1]} columns")
                    representations.append(f"Quality Score: {analysis.quality_score:.2f}")
                    representations.append(f"Complexity Score: {analysis.complexity_score:.2f}")

                    # Headers
                    if structure.headers and structure.headers[0]:
                        representations.append(f"Headers: {', '.join(structure.headers[0])}")

                    # Key columns
                    if analysis.key_columns:
                        representations.append(f"Key Columns: {', '.join(analysis.key_columns)}")

                    # Data types
                    if structure.data_types:
                        type_summary = {}
                        for dtype in structure.data_types:
                            type_summary[dtype] = type_summary.get(dtype, 0) + 1
                        type_str = ", ".join([f"{count} {dtype}" for dtype, count in type_summary.items()])
                        representations.append(f"Column Types: {type_str}")

                    # Sample data (first few rows)
                    if structure.data_rows and len(structure.data_rows) > 0:
                        sample_rows = structure.data_rows[:3]  # First 3 data rows
                        for i, row in enumerate(sample_rows):
                            row_str = " | ".join([str(cell) for cell in row])
                            representations.append(f"Row {i+1}: {row_str}")

                    # Relationships and correlations
                    if structure.relationships.get('correlations'):
                        corr_items = []
                        for col1, corrs in structure.relationships['correlations'].items():
                            for col2, corr_val in corrs.items():
                                if col1 != col2 and abs(corr_val) > 0.7:  # Strong correlations
                                    corr_items.append(".2f")
                        if corr_items:
                            representations.append(f"Strong Correlations: {', '.join(corr_items)}")

                    # Markdown representation if available
                    if table.get('markdown'):
                        representations.append(f"Content: {table['markdown']}")

                    # Combine all representations
                    table_text = " | ".join(representations)
                    table_embedding = self.generate_single(table_text)
                    table_embeddings.append(table_embedding)

                else:
                    # Fallback for tables without rows
                    fallback_text = f"Table: {table.get('markdown', 'No content available')}"
                    table_embedding = self.generate_single(fallback_text)
                    table_embeddings.append(table_embedding)

            if table_embeddings:
                # Use advanced fusion for multiple tables
                if len(table_embeddings) > 1:
                    combined = self._fuse_embeddings(table_embeddings, [1.0/len(table_embeddings)] * len(table_embeddings))
                else:
                    combined = table_embeddings[0]
                return combined

        except ImportError:
            log.warning("Advanced table processor not available, falling back to basic processing")
            # Fallback to original implementation
            return self._generate_table_embedding_basic(tables)
        except Exception as e:
            log.warning(f"Advanced table embedding failed: {str(e)}, falling back to basic")
            return self._generate_table_embedding_basic(tables)

        return None

    def _generate_table_embedding_basic(self, tables: List[Dict[str, Any]]) -> Optional[np.ndarray]:
        """Basic table embedding generation (fallback).

        Args:
            tables: List of table dictionaries

        Returns:
            Combined table embedding or None
        """
        if not tables:
            return None

        table_texts = []

        for table in tables:
            # Use multiple representations for richer embedding
            representations = []

            # Markdown representation
            if table.get('markdown'):
                representations.append(f"Table: {table['markdown']}")

            # Structured representation
            headers = table.get('headers', [])
            rows = table.get('rows', [])
            if headers and rows:
                # Create column-wise representation
                for i, header in enumerate(headers):
                    column_data = [row[i] if i < len(row) else "" for row in rows[:5]]  # First 5 rows
                    representations.append(f"Column {header}: {' | '.join(column_data)}")

            # Summary statistics
            shape = table.get('shape', (0, 0))
            representations.append(f"Table shape: {shape[0]} rows × {shape[1]} columns")

            table_texts.extend(representations)

        if table_texts:
            # Combine all table representations
            combined_table_text = " ".join(table_texts)
            return self.generate_single(combined_table_text)

        return None

    def _generate_image_embedding(self, images: List[Dict[str, Any]], use_clip: bool = False) -> Optional[np.ndarray]:
        """Generate embedding for image content.

        Args:
            images: List of image metadata
            use_clip: Whether to use CLIP model

        Returns:
            Combined image embedding or None
        """
        if not images:
            return None

        if use_clip:
            return self._generate_clip_embedding(images)
        else:
            # Fallback to text-based description
            return self._generate_image_description_embedding(images)

    def _generate_clip_embedding(self, images: List[Dict[str, Any]]) -> Optional[np.ndarray]:
        """Generate CLIP embeddings for images using enhanced CLIP processor.

        Args:
            images: List of image metadata

        Returns:
            CLIP-based embedding or None
        """
        try:
            from src.embeddings.clip_processor import CLIPProcessorEnhanced

            # Initialize CLIP processor if not already done
            if not hasattr(self, '_clip_processor'):
                self._clip_processor = CLIPProcessorEnhanced()

            image_embeddings = []

            for img_info in images:
                try:
                    # Load image if path is available
                    img_path = img_info.get('path')
                    if img_path and Path(img_path).exists():
                        # Use enhanced CLIP processor
                        img_embedding = self._clip_processor.get_image_embedding(img_path)
                        image_embeddings.append(img_embedding)
                    else:
                        # Use description-based embedding
                        desc = f"Image: {img_info.get('size', 'unknown size')} {img_info.get('type', 'image')}"
                        desc_embedding = self.generate_single(desc)
                        image_embeddings.append(desc_embedding)

                except Exception as e:
                    log.warning(f"Failed to process image: {str(e)}")
                    continue

            if image_embeddings:
                # Use advanced fusion for multiple images
                if len(image_embeddings) > 1:
                    combined = self._fuse_embeddings(image_embeddings, [1.0/len(image_embeddings)] * len(image_embeddings))
                else:
                    combined = image_embeddings[0]
                return combined

        except ImportError:
            log.warning("CLIP processor not available, falling back to text descriptions")
        except Exception as e:
            log.warning(f"CLIP embedding failed: {str(e)}")

        return None

    def _generate_image_description_embedding(self, images: List[Dict[str, Any]]) -> Optional[np.ndarray]:
        """Generate text-based embedding for image descriptions.

        Args:
            images: List of image metadata

        Returns:
            Text-based embedding for images
        """
        descriptions = []

        for img in images:
            desc_parts = [f"Image {img.get('index', 0)}"]

            if img.get('size'):
                desc_parts.append(f"size {img['size']}")
            if img.get('type'):
                desc_parts.append(f"type {img['type']}")
            if img.get('bbox'):
                desc_parts.append(f"position {img['bbox']}")

            descriptions.append(" ".join(desc_parts))

        if descriptions:
            combined_desc = "Images: " + "; ".join(descriptions)
            return self.generate_single(combined_desc)

        return None

    def _generate_code_embedding(self, code_blocks: List[str]) -> Optional[np.ndarray]:
        """Generate embedding for code content with advanced syntax-aware processing.

        Args:
            code_blocks: List of code blocks

        Returns:
            Code embedding or None
        """
        if not code_blocks:
            return None

        try:
            from src.pipeline.processors.code_processor import CodeProcessor

            # Initialize code processor
            code_processor = CodeProcessor()

            code_embeddings = []

            for code_block in code_blocks:
                try:
                    # Create temporary file-like object for processing
                    from io import StringIO
                    import tempfile
                    import os

                    # Try to detect language from code content
                    language = self._detect_code_language(code_block)

                    # Create temporary file with appropriate extension
                    extension = self._get_language_extension(language)
                    with tempfile.NamedTemporaryFile(mode='w', suffix=extension, delete=False) as temp_file:
                        temp_file.write(code_block)
                        temp_file_path = temp_file.name

                    try:
                        # Process the code file
                        analysis = code_processor.process_code_file(Path(temp_file_path), code_block)

                        # Generate rich text representation from analysis
                        code_text = code_processor.generate_code_embedding(analysis)

                        # Generate embedding from the rich representation
                        code_embedding = self.generate_single(code_text)
                        code_embeddings.append(code_embedding)

                    finally:
                        # Clean up temporary file
                        os.unlink(temp_file_path)

                except Exception as e:
                    log.warning(f"Failed to process code block: {str(e)}, using fallback")
                    # Fallback: use original simple approach
                    fallback_text = f"Code: {code_block[:500]}..." if len(code_block) > 500 else f"Code: {code_block}"
                    code_embedding = self.generate_single(fallback_text)
                    code_embeddings.append(code_embedding)

            if code_embeddings:
                # Use advanced fusion for multiple code blocks
                if len(code_embeddings) > 1:
                    combined = self._fuse_embeddings(code_embeddings, [1.0/len(code_embeddings)] * len(code_embeddings))
                else:
                    combined = code_embeddings[0]
                return combined

        except ImportError:
            log.warning("Advanced code processor not available, falling back to basic processing")
            # Fallback to original implementation
            return self._generate_code_embedding_basic(code_blocks)
        except Exception as e:
            log.warning(f"Advanced code embedding failed: {str(e)}, falling back to basic")
            return self._generate_code_embedding_basic(code_blocks)

        return None

    def _generate_code_embedding_basic(self, code_blocks: List[str]) -> Optional[np.ndarray]:
        """Basic code embedding generation (fallback).

        Args:
            code_blocks: List of code blocks

        Returns:
            Code embedding or None
        """
        if not code_blocks:
            return None

        # Combine code blocks with language hints
        code_text = "\n".join([f"Code: {code}" for code in code_blocks])
        return self.generate_single(code_text)

    def _detect_code_language(self, code: str) -> str:
        """Detect programming language from code content.

        Args:
            code: Code content

        Returns:
            Detected language
        """
        # Simple language detection based on keywords and syntax
        code_lower = code.lower().strip()

        if 'def ' in code or 'import ' in code or 'class ' in code:
            return 'python'
        elif 'function' in code or 'const ' in code or 'let ' in code or 'var ' in code:
            return 'javascript'
        elif 'public class' in code or 'import java.' in code:
            return 'java'
        elif '#include' in code or 'int main(' in code:
            return 'cpp'
        elif 'fn ' in code or 'let ' in code and 'use ' in code:
            return 'rust'
        elif '<?php' in code:
            return 'php'
        else:
            return 'unknown'

    def _get_language_extension(self, language: str) -> str:
        """Get file extension for language.

        Args:
            language: Programming language

        Returns:
            File extension
        """
        extensions = {
            'python': '.py',
            'javascript': '.js',
            'java': '.java',
            'cpp': '.cpp',
            'rust': '.rs',
            'php': '.php',
            'unknown': '.txt'
        }
        return extensions.get(language, '.txt')

    def _fuse_embeddings(self, embeddings: List[np.ndarray], weights: List[float]) -> np.ndarray:
        """Advanced embedding fusion using transformer-based multimodal fusion.

        Args:
            embeddings: List of embeddings to fuse
            weights: Corresponding weights

        Returns:
            Fused embedding
        """
        if len(embeddings) == 1:
            return embeddings[0]

        try:
            from src.embeddings.multimodal_fusion import (
                get_fusion_instance, ModalityEmbedding, AdaptiveFusionSelector
            )

            # Get fusion instance
            fusion_system = get_fusion_instance(embedding_dim=embeddings[0].shape[0])

            # Create modality embeddings (use generic type since we don't have specific types)
            modality_embeddings = []
            for i, (emb, weight) in enumerate(zip(embeddings, weights)):
                mod_emb = ModalityEmbedding(
                    modality_type=f'modality_{i}',
                    embedding=emb,
                    confidence=weight,  # Use weight as confidence
                    metadata={'index': i, 'original_weight': weight}
                )
                modality_embeddings.append(mod_emb)

            # Select fusion method adaptively
            selector = AdaptiveFusionSelector()
            fusion_method = selector.select_fusion_method(modality_embeddings)

            # Perform fusion
            fusion_result = fusion_system.fuse_embeddings(modality_embeddings, fusion_method)

            log.debug(f"Used fusion method: {fusion_result.fusion_method}, confidence: {fusion_result.fusion_confidence:.2f}")

            return fusion_result.fused_embedding

        except ImportError:
            log.warning("Advanced fusion system not available, falling back to basic fusion")
            return self._fuse_embeddings_basic(embeddings, weights)
        except Exception as e:
            log.warning(f"Advanced fusion failed: {str(e)}, falling back to basic")
            return self._fuse_embeddings_basic(embeddings, weights)

    def _fuse_embeddings_basic(self, embeddings: List[np.ndarray], weights: List[float]) -> np.ndarray:
        """Basic embedding fusion (fallback).

        Args:
            embeddings: List of embeddings to fuse
            weights: Corresponding weights

        Returns:
            Fused embedding
        """
        if len(embeddings) == 1:
            return embeddings[0]

        # Normalize weights
        total_weight = sum(weights)
        if total_weight > 0:
            normalized_weights = [w / total_weight for w in weights]
        else:
            normalized_weights = [1.0 / len(embeddings)] * len(embeddings)

        # Simple weighted fusion
        combined_embedding = np.zeros_like(embeddings[0])
        for embedding, weight in zip(embeddings, normalized_weights):
            combined_embedding += embedding * weight

        # Final normalization
        combined_embedding = combined_embedding / np.linalg.norm(combined_embedding)

        return combined_embedding

    def generate_document_embedding(self, document: Document) -> np.ndarray:
        """Generate embedding for a document, using structured content if available.

        Args:
            document: Document object

        Returns:
            Document embedding
        """
        if document.structured_content:
            return self.generate_structured(document.structured_content)
        else:
            # Fallback to text content
            return self.generate_single(document.content)

    def _load_qwen_vl_model(self):
        """Load Alibaba-NLP/gme-Qwen2-VL-2B-Instruct model."""
        try:
            from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer
            import torch

            log.info(f"Loading Qwen2-VL model: {self.model_name}")
            self.model = Qwen2VLForConditionalGeneration.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16,  # Use half precision for memory efficiency
                device_map="auto"  # Auto device placement
            )
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model.eval()
            log.info("Qwen2-VL model loaded successfully")
        except Exception as e:
            log.error(f"Failed to load Qwen2-VL model: {e}")
            raise

    def _load_e5_v_model(self):
        """Load royokong/e5-v model."""
        try:
            from transformers import AutoModel, AutoTokenizer
            import torch

            log.info(f"Loading E5-V model: {self.model_name}")
            self.model = AutoModel.from_pretrained(self.model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model.eval()
            log.info("E5-V model loaded successfully")
        except Exception as e:
            log.error(f"Failed to load E5-V model: {e}")
            raise

    def _load_vlm2vec_model(self):
        """Load TIGER-Lab/VLM2Vec-LoRA model."""
        try:
            from transformers import AutoModel, AutoTokenizer
            import torch

            log.info(f"Loading VLM2Vec model: {self.model_name}")
            self.model = AutoModel.from_pretrained(self.model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model.eval()
            log.info("VLM2Vec model loaded successfully")
        except Exception as e:
            log.error(f"Failed to load VLM2Vec model: {e}")
            raise

    def _load_mm_embed_model(self):
        """Load nvidia/MM-Embed model."""
        try:
            from transformers import AutoModel, AutoTokenizer
            import torch

            log.info(f"Loading MM-Embed model: {self.model_name}")
            self.model = AutoModel.from_pretrained(self.model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model.eval()
            log.info("MM-Embed model loaded successfully")
        except Exception as e:
            log.error(f"Failed to load MM-Embed model: {e}")
            raise

    def _load_care_model(self):
        """Load MCG-NJU/CaRe-7B model."""
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer
            import torch

            log.info(f"Loading CaRe model: {self.model_name}")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model.eval()
            log.info("CaRe model loaded successfully")
        except Exception as e:
            log.error(f"Failed to load CaRe model: {e}")
            raise

    def _load_unime_model(self):
        """Load DeepGlint-AI/UniME models."""
        try:
            from transformers import AutoModel, AutoTokenizer
            import torch

            log.info(f"Loading UniME model: {self.model_name}")
            self.model = AutoModel.from_pretrained(self.model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model.eval()
            log.info("UniME model loaded successfully")
        except Exception as e:
            log.error(f"Failed to load UniME model: {e}")
            raise

    def _load_bge_vl_model(self):
        """Load BAAI/BGE-VL-base model."""
        try:
            from transformers import AutoModel, AutoTokenizer
            import torch

            log.info(f"Loading BGE-VL model: {self.model_name}")
            self.model = AutoModel.from_pretrained(self.model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model.eval()
            log.info("BGE-VL model loaded successfully")
        except Exception as e:
            log.error(f"Failed to load BGE-VL model: {e}")
            raise

    def _generate_qwen_vl_embeddings(self, texts: List[str], batch_size: int = 8, normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using Qwen2-VL model."""
        import torch
        
        # Check if tokenizer is available
        if not hasattr(self, 'tokenizer') or self.tokenizer is None:
            log.warning("Tokenizer not available, generating random embeddings as fallback")
            # Generate random embeddings with proper dimensions as final fallback
            embeddings = np.random.randn(len(texts), self._get_embedding_dimension()).astype(np.float32)
            if normalize_embeddings:
                embeddings = normalize(embeddings)
            log.info(f"Generated fallback random embeddings with shape: {embeddings.shape}")
            return embeddings

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]

            batch_embeddings = []
            for text in batch_texts:
                try:
                    # Prepare text input for Qwen VL
                    messages = [{"role": "user", "content": text}]
                    text_input = self.tokenizer.apply_chat_template(
                        messages, tokenize=False, add_generation_prompt=True
                    )

                    # Tokenize
                    inputs = self.tokenizer(
                        text_input,
                        return_tensors="pt",
                        padding=True,
                        truncation=True,
                        max_length=512
                    ).to(self.model.device)

                    # Generate embeddings
                    with torch.no_grad():
                        outputs = self.model(**inputs, output_hidden_states=True)
                        # Use the last hidden state and mean pool
                        hidden_states = outputs.hidden_states[-1]
                        text_embedding = hidden_states.mean(dim=1).squeeze().cpu().numpy()

                    batch_embeddings.append(text_embedding)

                except Exception as e:
                    log.warning(f"Failed to generate embedding for text: {str(e)[:100]}...")
                    # Fallback: use zero embedding
                    text_embedding = np.zeros(self._get_embedding_dimension())
                    batch_embeddings.append(text_embedding)

            embeddings.extend(batch_embeddings)

        embeddings_array = np.array(embeddings)

        if normalize_embeddings:
            embeddings_array = normalize(embeddings_array)

        log.info(f"Generated Qwen2-VL embeddings with shape: {embeddings_array.shape}")
        return embeddings_array

    def _generate_e5_v_embeddings(self, texts: List[str], batch_size: int = 64, normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using E5-V model."""
        import torch

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]

            # E5-V expects "query: " or "passage: " prefixes
            prefixed_texts = [f"passage: {text}" for text in batch_texts]

            inputs = self.tokenizer(prefixed_texts, return_tensors='pt', padding=True, truncation=True, max_length=512)

            with torch.no_grad():
                outputs = self.model(**inputs)
                batch_embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()

            embeddings.extend(batch_embeddings)

        embeddings_array = np.array(embeddings)

        if normalize_embeddings:
            embeddings_array = normalize(embeddings_array)

        log.info(f"Generated E5-V embeddings with shape: {embeddings_array.shape}")
        return embeddings_array

    def _generate_vlm2vec_embeddings(self, texts: List[str], batch_size: int = 64, normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using VLM2Vec model."""
        import torch

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]

            inputs = self.tokenizer(batch_texts, return_tensors='pt', padding=True, truncation=True, max_length=512)

            with torch.no_grad():
                outputs = self.model(**inputs)
                batch_embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()

            embeddings.extend(batch_embeddings)

        embeddings_array = np.array(embeddings)

        if normalize_embeddings:
            embeddings_array = normalize(embeddings_array)

        log.info(f"Generated VLM2Vec embeddings with shape: {embeddings_array.shape}")
        return embeddings_array

    def _generate_mm_embed_embeddings(self, texts: List[str], batch_size: int = 64, normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using MM-Embed model."""
        import torch

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]

            inputs = self.tokenizer(batch_texts, return_tensors='pt', padding=True, truncation=True, max_length=512)

            with torch.no_grad():
                outputs = self.model(**inputs)
                batch_embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()

            embeddings.extend(batch_embeddings)

        embeddings_array = np.array(embeddings)

        if normalize_embeddings:
            embeddings_array = normalize(embeddings_array)

        log.info(f"Generated MM-Embed embeddings with shape: {embeddings_array.shape}")
        return embeddings_array

    def _generate_care_embeddings(self, texts: List[str], batch_size: int = 8, normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using CaRe model."""
        import torch

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]

            inputs = self.tokenizer(batch_texts, return_tensors='pt', padding=True, truncation=True, max_length=512)

            with torch.no_grad():
                outputs = self.model(**inputs, output_hidden_states=True)
                batch_embeddings = outputs.hidden_states[-1].mean(dim=1).cpu().numpy()

            embeddings.extend(batch_embeddings)

        embeddings_array = np.array(embeddings)

        if normalize_embeddings:
            embeddings_array = normalize(embeddings_array)

        log.info(f"Generated CaRe embeddings with shape: {embeddings_array.shape}")
        return embeddings_array

    def _generate_unime_embeddings(self, texts: List[str], batch_size: int = 64, normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using UniME model."""
        import torch

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]

            inputs = self.tokenizer(batch_texts, return_tensors='pt', padding=True, truncation=True, max_length=512)

            with torch.no_grad():
                outputs = self.model(**inputs)
                batch_embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()

            embeddings.extend(batch_embeddings)

        embeddings_array = np.array(embeddings)

        if normalize_embeddings:
            embeddings_array = normalize(embeddings_array)

        log.info(f"Generated UniME embeddings with shape: {embeddings_array.shape}")
        return embeddings_array

    def _generate_bge_vl_embeddings(self, texts: List[str], batch_size: int = 64, normalize_embeddings: bool = True) -> np.ndarray:
        """Generate embeddings using BGE-VL model."""
        import torch

        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]

            inputs = self.tokenizer(batch_texts, return_tensors='pt', padding=True, truncation=True, max_length=512)

            with torch.no_grad():
                outputs = self.model(**inputs)
                batch_embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()

            embeddings.extend(batch_embeddings)

        embeddings_array = np.array(embeddings)

        if normalize_embeddings:
            embeddings_array = normalize(embeddings_array)

        log.info(f"Generated BGE-VL embeddings with shape: {embeddings_array.shape}")
        return embeddings_array

    def _get_embedding_dimension(self) -> int:
        """Get the embedding dimension for this model."""
        # This is a simplified approach - in practice you'd query the model
        if "ada" in self.model_name.lower():
            return 1536  # OpenAI ada-002
        elif "text-embedding-3-small" in self.model_name.lower():
            return 1536
        elif "text-embedding-3-large" in self.model_name.lower():
            return 3072
        elif "cohere" in self.model_name.lower():
            return 4096  # Cohere embed-multilingual-v3.0
        elif "gme-Qwen2-VL" in self.model_name.lower():
            return 1536  # Qwen2-VL models typically use 1536
        elif "e5-v" in self.model_name.lower():
            return 1024  # E5-V models
        elif "VLM2Vec" in self.model_name.lower():
            return 768  # VLM2Vec models
        elif "MM-Embed" in self.model_name.lower():
            return 768  # MM-Embed models
        elif "CaRe" in self.model_name.lower():
            return 4096  # CaRe models
        elif "UniME" in self.model_name.lower():
            return 1024  # UniME models
        elif "BGE-VL" in self.model_name.lower():
            return 768  # BGE-VL models
        else:
            # For sentence transformers, we'd need to load and check
            # Default to 384 for many SBERT models
            return 384
