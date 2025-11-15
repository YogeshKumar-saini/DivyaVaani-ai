"""Advanced multimodal fusion techniques for embeddings using Hugging Face."""

import numpy as np
import requests
from typing import List, Dict, Any, Optional, Tuple, Union
from dataclasses import dataclass
from src.utils.logger import log
import os


@dataclass
class ModalityEmbedding:
    """Container for modality-specific embeddings."""
    modality_type: str  # 'text', 'image', 'table', 'code', 'audio', 'video'
    embedding: np.ndarray
    confidence: float
    metadata: Dict[str, Any]


@dataclass
class FusionResult:
    """Result of multimodal fusion."""
    fused_embedding: np.ndarray
    attention_weights: Dict[str, float]
    modality_contributions: Dict[str, float]
    fusion_confidence: float
    fusion_method: str


class NumpyAttentionFusion:
    """Pure numpy-based attention fusion without PyTorch."""

    def __init__(self, embedding_dim: int = 384):
        self.embedding_dim = embedding_dim

    def fuse_embeddings(self, embeddings: List[np.ndarray], weights: Optional[List[float]] = None) -> Tuple[np.ndarray, np.ndarray]:
        """Fuse embeddings using attention mechanism.

        Args:
            embeddings: List of numpy embeddings
            weights: Optional confidence weights

        Returns:
            Fused embedding and attention weights
        """
        if len(embeddings) == 1:
            return embeddings[0], np.ones(1)

        if not weights:
            weights = [1.0] * len(embeddings)

        # Normalize weights
        weights = np.array(weights, dtype=np.float32)
        weights = weights / np.sum(weights)

        # Simple attention: use weighted average with some attention bias
        stacked_emb = np.stack(embeddings)  # [num_embeddings, embedding_dim]

        # Compute pairwise similarities for attention
        similarities = np.dot(stacked_emb, stacked_emb.T) / self.embedding_dim

        # Apply softmax to get attention weights
        attention_weights = np.exp(similarities) / np.sum(np.exp(similarities), axis=1, keepdims=True)

        # Weight by confidence scores
        final_weights = attention_weights.mean(axis=0) * weights
        final_weights = final_weights / np.sum(final_weights)

        # Apply attention
        fused = np.sum(stacked_emb * final_weights[:, np.newaxis], axis=0)

        return fused, final_weights


class HuggingFaceFusion:
    """Fusion using Hugging Face models for advanced processing."""

    def __init__(self, embedding_dim: int = 384):
        self.embedding_dim = embedding_dim
        self.api_token = os.getenv('HUGGINGFACE_API_TOKEN') or os.getenv('HF_TOKEN')
        self.api_url = "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    def fuse_with_model(self, texts: List[str]) -> Optional[np.ndarray]:
        """Use Hugging Face model to fuse text representations.

        Args:
            texts: List of text representations to fuse

        Returns:
            Fused embedding or None
        """
        if not self.api_token:
            return None

        try:
            headers = {"Authorization": f"Bearer {self.api_token}"}

            # Combine texts for fusion
            combined_text = " | ".join(texts)

            payload = {
                "inputs": combined_text,
                "options": {"wait_for_model": True}
            }

            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()

            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                embedding = np.array(result[0])
            else:
                embedding = np.array(result)

            return embedding / np.linalg.norm(embedding)  # Normalize

        except Exception as e:
            log.warning(f"Hugging Face fusion failed: {e}")
            return None


class AdvancedMultimodalFusion:
    """Advanced multimodal fusion system using only numpy and Hugging Face."""

    def __init__(self, embedding_dim: int = 384):
        self.embedding_dim = embedding_dim
        self.attention_fusion = NumpyAttentionFusion(embedding_dim)
        self.hf_fusion = HuggingFaceFusion(embedding_dim)

    def fuse_embeddings(self, modality_embeddings: List[ModalityEmbedding],
                       fusion_method: str = 'attention') -> FusionResult:
        """Fuse multiple modality embeddings.

        Args:
            modality_embeddings: List of ModalityEmbedding objects
            fusion_method: Fusion method ('attention', 'weighted', 'concat', 'hf')

        Returns:
            FusionResult with fused embedding and metadata
        """
        if not modality_embeddings:
            # Return zero embedding if no modalities
            zero_emb = np.zeros(self.embedding_dim)
            return FusionResult(
                fused_embedding=zero_emb,
                attention_weights={},
                modality_contributions={},
                fusion_confidence=0.0,
                fusion_method='none'
            )

        if len(modality_embeddings) == 1:
            # Single modality - return as is
            single_emb = modality_embeddings[0]
            return FusionResult(
                fused_embedding=single_emb.embedding,
                attention_weights={single_emb.modality_type: 1.0},
                modality_contributions={single_emb.modality_type: 1.0},
                fusion_confidence=single_emb.confidence,
                fusion_method='single'
            )

        # Extract embeddings and metadata
        embeddings = []
        modality_types = []
        confidences = []
        text_representations = []

        for mod_emb in modality_embeddings:
            # Ensure correct dimension
            emb = mod_emb.embedding
            if emb.shape[0] != self.embedding_dim:
                # Pad or truncate if necessary
                if emb.shape[0] < self.embedding_dim:
                    emb = np.pad(emb, (0, self.embedding_dim - emb.shape[0]))
                else:
                    emb = emb[:self.embedding_dim]

            embeddings.append(emb)
            modality_types.append(mod_emb.modality_type)
            confidences.append(mod_emb.confidence)

            # Create text representation for HF fusion
            text_repr = f"{mod_emb.modality_type}: {mod_emb.metadata.get('text', str(mod_emb.metadata))}"
            text_representations.append(text_repr)

        # Choose fusion method
        if fusion_method == 'hf' and self.hf_fusion.api_token:
            # Try Hugging Face fusion first
            hf_result = self.hf_fusion.fuse_with_model(text_representations)
            if hf_result is not None:
                fused_np = hf_result
                attention_weights = np.ones(len(embeddings)) / len(embeddings)
                fusion_method_used = 'hf'
            else:
                # Fallback to attention
                fused_np, attention_weights = self.attention_fusion.fuse_embeddings(embeddings, confidences)
                fusion_method_used = 'attention_fallback'
        elif fusion_method == 'attention':
            fused_np, attention_weights = self.attention_fusion.fuse_embeddings(embeddings, confidences)
            fusion_method_used = 'attention'
        elif fusion_method == 'weighted':
            fused_np, attention_weights = self._weighted_fusion(embeddings, confidences)
            fusion_method_used = 'weighted'
        elif fusion_method == 'concat':
            fused_np, attention_weights = self._concat_fusion(embeddings)
            fusion_method_used = 'concat'
        else:
            # Default to attention fusion
            fused_np, attention_weights = self.attention_fusion.fuse_embeddings(embeddings, confidences)
            fusion_method_used = 'attention'

        # Ensure proper normalization
        fused_np = fused_np / np.linalg.norm(fused_np)

        # Calculate attention weights and contributions
        attention_dict = {}
        contributions = {}

        for i, mod_type in enumerate(modality_types):
            if i < len(attention_weights):
                attention_dict[mod_type] = float(attention_weights[i])
                contributions[mod_type] = float(attention_weights[i])
            else:
                attention_dict[mod_type] = 1.0 / len(modality_types)
                contributions[mod_type] = 1.0 / len(modality_types)

        # Calculate fusion confidence
        avg_confidence = np.mean(confidences) if confidences else 0.5
        modality_diversity = len(set(modality_types)) / len(modality_types)  # Diversity bonus
        fusion_confidence = min(1.0, avg_confidence * (1 + modality_diversity * 0.2))

        return FusionResult(
            fused_embedding=fused_np,
            attention_weights=attention_dict,
            modality_contributions=contributions,
            fusion_confidence=fusion_confidence,
            fusion_method=fusion_method_used
        )

    def _weighted_fusion(self, embeddings: List[np.ndarray], weights: List[float]) -> Tuple[np.ndarray, np.ndarray]:
        """Weighted fusion based on confidence scores."""
        if not weights:
            weights = [1.0] * len(embeddings)

        # Normalize weights
        weights = np.array(weights, dtype=np.float32)
        weights = weights / np.sum(weights)

        # Weighted combination
        stacked_emb = np.stack(embeddings)
        fused = np.sum(stacked_emb * weights[:, np.newaxis], axis=0)

        return fused, weights

    def _concat_fusion(self, embeddings: List[np.ndarray]) -> Tuple[np.ndarray, np.ndarray]:
        """Concatenation-based fusion with dimensionality reduction."""
        # Concatenate all embeddings
        concat_emb = np.concatenate(embeddings)

        # Simple dimensionality reduction using PCA-like approach
        # For now, just average chunks
        chunk_size = len(concat_emb) // self.embedding_dim
        if chunk_size > 0:
            fused = np.array([np.mean(concat_emb[i*chunk_size:(i+1)*chunk_size])
                            for i in range(self.embedding_dim)])
        else:
            # Pad or truncate
            if len(concat_emb) < self.embedding_dim:
                fused = np.pad(concat_emb, (0, self.embedding_dim - len(concat_emb)))
            else:
                fused = concat_emb[:self.embedding_dim]

        # Equal attention weights
        attention_weights = np.ones(len(embeddings)) / len(embeddings)

        return fused, attention_weights

    def get_fusion_stats(self) -> Dict[str, Any]:
        """Get fusion system statistics."""
        return {
            'embedding_dim': self.embedding_dim,
            'fusion_methods': ['attention', 'weighted', 'concat', 'hf'],
            'hf_available': self.hf_fusion.api_token is not None
        }


class AdaptiveFusionSelector:
    """Adaptive fusion method selector based on content characteristics."""

    def __init__(self):
        self.fusion_methods = ['transformer', 'attention', 'weighted', 'concat']

    def select_fusion_method(self, modality_embeddings: List[ModalityEmbedding]) -> str:
        """Select best fusion method based on modalities and their characteristics.

        Args:
            modality_embeddings: List of modality embeddings

        Returns:
            Recommended fusion method
        """
        if len(modality_embeddings) <= 1:
            return 'single'

        modality_types = [emb.modality_type for emb in modality_embeddings]
        confidences = [emb.confidence for emb in modality_embeddings]

        # High confidence across modalities -> use transformer
        avg_confidence = np.mean(confidences)
        if avg_confidence > 0.8 and len(modality_types) >= 3:
            return 'transformer'

        # Mixed modalities with varying confidence -> use attention
        confidence_std = np.std(confidences)
        if confidence_std > 0.2:
            return 'attention'

        # Similar modalities -> use weighted fusion
        unique_modalities = set(modality_types)
        if len(unique_modalities) == 1 or (len(unique_modalities) == 2 and len(modality_types) <= 3):
            return 'weighted'

        # Many modalities -> use concat
        return 'concat'


# Global fusion instance
_fusion_instance = None

def get_fusion_instance(embedding_dim: int = 384) -> AdvancedMultimodalFusion:
    """Get global fusion instance."""
    global _fusion_instance
    if _fusion_instance is None:
        _fusion_instance = AdvancedMultimodalFusion(embedding_dim=embedding_dim)

    return _fusion_instance
