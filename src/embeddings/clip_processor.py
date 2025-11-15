"""Enhanced CLIP processor for vision-language embeddings using Hugging Face."""

import numpy as np
import requests
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
from PIL import Image as PILImage
import io
import base64
from src.utils.logger import log
import os


class CLIPProcessorEnhanced:
    """Enhanced CLIP processor using Hugging Face Inference API."""

    def __init__(self, model_name: str = "openai/clip-vit-base-patch32", use_api: bool = True):
        """Initialize CLIP processor.

        Args:
            model_name: CLIP model to use
            use_api: Whether to use Hugging Face API instead of local models
        """
        self.model_name = model_name
        self.use_api = use_api
        self.api_token = os.getenv('HUGGINGFACE_API_TOKEN') or os.getenv('HF_TOKEN')
        self.api_url = f"https://api-inference.huggingface.co/models/{model_name}"

        if use_api and not self.api_token:
            log.warning("Hugging Face API token not found, falling back to local model")
            self.use_api = False

        if not self.use_api:
            self._load_local_model()
        else:
            log.info("Using Hugging Face Inference API for CLIP")

    def _load_local_model(self):
        """Load CLIP model locally as fallback."""
        try:
            import torch
            from transformers import CLIPModel, CLIPProcessor, CLIPTokenizer

            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            log.info(f"Loading local CLIP model: {self.model_name}")

            self.model = CLIPModel.from_pretrained(self.model_name).to(self.device)
            self.processor = CLIPProcessor.from_pretrained(self.model_name)
            self.tokenizer = CLIPTokenizer.from_pretrained(self.model_name)
            log.info("Local CLIP model loaded successfully")
        except Exception as e:
            log.error(f"Failed to load local CLIP model: {e}")
            raise

    def preprocess_image(self, image_input: Union[str, Path, PILImage.Image, bytes]) -> PILImage.Image:
        """Preprocess image for CLIP.

        Args:
            image_input: Image input (path, PIL Image, or bytes)

        Returns:
            Preprocessed PIL Image
        """
        try:
            if isinstance(image_input, (str, Path)):
                image = PILImage.open(image_input).convert('RGB')
            elif isinstance(image_input, bytes):
                image = PILImage.open(io.BytesIO(image_input)).convert('RGB')
            elif isinstance(image_input, PILImage.Image):
                image = image_input.convert('RGB')
            else:
                raise ValueError(f"Unsupported image input type: {type(image_input)}")

            # Apply preprocessing (resize, normalize, etc.)
            # CLIP processor handles most preprocessing, but we can add custom steps
            return image

        except Exception as e:
            log.error(f"Image preprocessing failed: {e}")
            raise

    def get_image_embedding(self, image_input: Union[str, Path, PILImage.Image, bytes]) -> np.ndarray:
        """Generate image embedding.

        Args:
            image_input: Image input

        Returns:
            Normalized image embedding
        """
        if self.use_api:
            return self._get_image_embedding_api(image_input)
        else:
            return self._get_image_embedding_local(image_input)

    def _get_image_embedding_api(self, image_input: Union[str, Path, PILImage.Image, bytes]) -> np.ndarray:
        """Generate image embedding using Hugging Face API."""
        try:
            # Convert image to base64
            image = self.preprocess_image(image_input)

            # Convert to RGB and save to bytes
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG')
            image_bytes = buffer.getvalue()
            image_b64 = base64.b64encode(image_bytes).decode('utf-8')

            # Prepare API request
            headers = {"Authorization": f"Bearer {self.api_token}"}
            payload = {
                "inputs": {
                    "image": image_b64
                },
                "options": {"wait_for_model": True}
            }

            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()

            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                embedding = np.array(result[0])  # First result
            else:
                embedding = np.array(result)

            # Normalize
            embedding = embedding / np.linalg.norm(embedding)
            return embedding

        except Exception as e:
            log.error(f"Hugging Face API image embedding failed: {e}")
            # Fallback to local if available
            if hasattr(self, 'model'):
                return self._get_image_embedding_local(image_input)
            raise

    def _get_image_embedding_local(self, image_input: Union[str, Path, PILImage.Image, bytes]) -> np.ndarray:
        """Generate image embedding using local model."""
        try:
            import torch
            image = self.preprocess_image(image_input)

            # Process image
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)

            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)

            # Convert to numpy and normalize
            embedding = image_features.squeeze().cpu().numpy()
            embedding = embedding / np.linalg.norm(embedding)

            return embedding

        except Exception as e:
            log.error(f"Local image embedding generation failed: {e}")
            raise

    def get_text_embedding(self, text: str) -> np.ndarray:
        """Generate text embedding.

        Args:
            text: Input text

        Returns:
            Normalized text embedding
        """
        if self.use_api:
            return self._get_text_embedding_api(text)
        else:
            return self._get_text_embedding_local(text)

    def _get_text_embedding_api(self, text: str) -> np.ndarray:
        """Generate text embedding using Hugging Face API."""
        try:
            headers = {"Authorization": f"Bearer {self.api_token}"}
            payload = {
                "inputs": text,
                "options": {"wait_for_model": True}
            }

            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()

            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                embedding = np.array(result[0])  # First result
            else:
                embedding = np.array(result)

            # Normalize
            embedding = embedding / np.linalg.norm(embedding)
            return embedding

        except Exception as e:
            log.error(f"Hugging Face API text embedding failed: {e}")
            # Fallback to local if available
            if hasattr(self, 'model'):
                return self._get_text_embedding_local(text)
            raise

    def _get_text_embedding_local(self, text: str) -> np.ndarray:
        """Generate text embedding using local model."""
        try:
            import torch
            inputs = self.tokenizer([text], return_tensors="pt", padding=True, truncation=True).to(self.device)

            with torch.no_grad():
                text_features = self.model.get_text_features(**inputs)

            # Convert to numpy and normalize
            embedding = text_features.squeeze().cpu().numpy()
            embedding = embedding / np.linalg.norm(embedding)

            return embedding

        except Exception as e:
            log.error(f"Local text embedding generation failed: {e}")
            raise

    def get_vision_language_similarity(self, image_input: Union[str, Path, PILImage.Image, bytes],
                                     texts: List[str]) -> np.ndarray:
        """Compute similarity between image and text descriptions.

        Args:
            image_input: Image input
            texts: List of text descriptions

        Returns:
            Similarity scores for each text
        """
        try:
            image = self.preprocess_image(image_input)

            # Process image and texts
            inputs = self.processor(text=texts, images=image, return_tensors="pt", padding=True).to(self.device)

            with torch.no_grad():
                outputs = self.model(**inputs)
                logits_per_image = outputs.logits_per_image
                probs = logits_per_image.softmax(dim=1)

            return probs.squeeze().cpu().numpy()

        except Exception as e:
            log.error(f"Vision-language similarity computation failed: {e}")
            raise

    def batch_process_images(self, image_inputs: List[Union[str, Path, PILImage.Image, bytes]],
                           batch_size: int = 8) -> np.ndarray:
        """Batch process multiple images.

        Args:
            image_inputs: List of image inputs
            batch_size: Batch size for processing

        Returns:
            Array of image embeddings
        """
        embeddings = []

        for i in range(0, len(image_inputs), batch_size):
            batch_inputs = image_inputs[i:i + batch_size]

            try:
                # Preprocess batch
                images = [self.preprocess_image(img) for img in batch_inputs]

                # Process batch
                inputs = self.processor(images=images, return_tensors="pt").to(self.device)

                with torch.no_grad():
                    image_features = self.model.get_image_features(**inputs)

                # Convert to numpy and normalize
                batch_embeddings = image_features.cpu().numpy()
                batch_embeddings = batch_embeddings / np.linalg.norm(batch_embeddings, axis=1, keepdims=True)

                embeddings.extend(batch_embeddings)

            except Exception as e:
                log.error(f"Batch processing failed for batch {i//batch_size}: {e}")
                # Add zero embeddings for failed images
                embeddings.extend([np.zeros(self.model.config.projection_dim)] * len(batch_inputs))

        return np.array(embeddings)

    def extract_image_features(self, image_input: Union[str, Path, PILImage.Image, bytes],
                             layer: str = "last_hidden_state") -> np.ndarray:
        """Extract intermediate features from CLIP vision model.

        Args:
            image_input: Image input
            layer: Which layer features to extract

        Returns:
            Image features
        """
        try:
            image = self.preprocess_image(image_input)

            inputs = self.processor(images=image, return_tensors="pt").to(self.device)

            with torch.no_grad():
                outputs = self.model.vision_model(**inputs)

                if layer == "last_hidden_state":
                    features = outputs.last_hidden_state
                elif layer == "pooler_output":
                    features = outputs.pooler_output
                else:
                    features = outputs.hidden_states[int(layer)] if hasattr(outputs, 'hidden_states') else outputs.last_hidden_state

            return features.squeeze().cpu().numpy()

        except Exception as e:
            log.error(f"Feature extraction failed: {e}")
            raise


class MultiCLIPProcessor:
    """Multi-model CLIP processor supporting different CLIP variants."""

    def __init__(self, models_config: Dict[str, str] = None):
        """Initialize multi-model CLIP processor.

        Args:
            models_config: Dict mapping model names to model identifiers
        """
        if models_config is None:
            models_config = {
                "clip-vit-base": "openai/clip-vit-base-patch32",
                "clip-vit-large": "openai/clip-vit-large-patch14",
                "clip-vit-huge": "openai/clip-vit-large-patch14-336"
            }

        self.models = {}
        for name, model_id in models_config.items():
            try:
                self.models[name] = CLIPProcessorEnhanced(model_id)
                log.info(f"Loaded CLIP model: {name}")
            except Exception as e:
                log.warning(f"Failed to load CLIP model {name}: {e}")

    def get_processor(self, model_name: str = "clip-vit-base") -> CLIPProcessorEnhanced:
        """Get CLIP processor for specific model.

        Args:
            model_name: Model name

        Returns:
            CLIPProcessorEnhanced instance
        """
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not available. Available: {list(self.models.keys())}")

        return self.models[model_name]

    def get_best_model_for_task(self, task: str) -> str:
        """Get best model for specific task.

        Args:
            task: Task type ("general", "detailed", "large_images")

        Returns:
            Model name
        """
        model_mapping = {
            "general": "clip-vit-base",
            "detailed": "clip-vit-large",
            "large_images": "clip-vit-huge"
        }

        return model_mapping.get(task, "clip-vit-base")
