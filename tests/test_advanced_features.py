"""Comprehensive test suite for advanced multimodal features."""

import numpy as np
import pandas as pd
import tempfile
import os
from pathlib import Path
import pytest
from src.embeddings.clip_processor import CLIPProcessorEnhanced, MultiCLIPProcessor
from src.pipeline.processors.table_processor import AdvancedTableProcessor, TableAnalysis
from src.pipeline.processors.code_processor import CodeProcessor, CodeAnalysis
from src.embeddings.distributed_cache import DistributedCache, MemoryCacheBackend
from src.embeddings.multimodal_fusion import (
    AdvancedMultimodalFusion, ModalityEmbedding, AdaptiveFusionSelector
)
from src.embeddings.generator import EmbeddingGenerator
from src.pipeline.models import StructuredContent
from PIL import Image
import torch


def test_clip_processor_enhanced():
    """Test enhanced CLIP processor functionality."""
    print("Testing CLIP Processor Enhanced...")

    try:
        # Test with API mode (should fall back to local if no token)
        processor = CLIPProcessorEnhanced(use_api=True)

        # Test basic initialization - we can't test actual embeddings without proper setup
        # but we can test that the class initializes correctly
        assert hasattr(processor, 'use_api')
        assert hasattr(processor, 'get_text_embedding')
        assert hasattr(processor, 'get_image_embedding')

        # Test that it has the right API URL
        expected_url = "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32"
        assert processor.api_url == expected_url

        print("✓ CLIP Processor Enhanced - PASSED")
        return True

    except Exception as e:
        print(f"✗ CLIP Processor Enhanced - FAILED: {e}")
        return False


def test_multi_clip_processor():
    """Test multi-model CLIP processor."""
    print("Testing Multi-CLIP Processor...")

    try:
        multi_processor = MultiCLIPProcessor()

        # Test model selection
        model_name = multi_processor.get_best_model_for_task("general")
        assert model_name in multi_processor.models

        # Test processor retrieval
        processor = multi_processor.get_processor(model_name)
        assert isinstance(processor, CLIPProcessorEnhanced)

        print("✓ Multi-CLIP Processor - PASSED")
        return True

    except Exception as e:
        print(f"✗ Multi-CLIP Processor - FAILED: {e}")
        return False


def test_advanced_table_processor():
    """Test advanced table processor functionality."""
    print("Testing Advanced Table Processor...")

    try:
        processor = AdvancedTableProcessor()

        # Create test table data
        table_data = [
            ['Name', 'Age', 'City', 'Salary'],
            ['John', 25, 'NYC', 50000],
            ['Jane', 30, 'LA', 60000],
            ['Bob', 35, 'Chicago', 70000]
        ]

        analysis = processor.process_table(table_data)

        assert isinstance(analysis, TableAnalysis)
        assert analysis.quality_score > 0
        assert analysis.complexity_score >= 0
        assert analysis.semantic_type in ['data_table', 'summary_table', 'comparison_table']
        assert len(analysis.key_columns) >= 0

        # Test table normalization
        df = processor.normalize_table(analysis)
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 3  # 3 data rows

        print("✓ Advanced Table Processor - PASSED")
        return True

    except Exception as e:
        print(f"✗ Advanced Table Processor - FAILED: {e}")
        return False


def test_code_processor():
    """Test code processor functionality."""
    print("Testing Code Processor...")

    try:
        processor = CodeProcessor()

        # Test Python code analysis
        python_code = '''
def calculate_fibonacci(n):
    """Calculate nth Fibonacci number."""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

class Calculator:
    def add(self, a, b):
        return a + b
'''

        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(python_code)
            temp_path = f.name

        try:
            analysis = processor.process_code_file(Path(temp_path))

            assert isinstance(analysis, CodeAnalysis)
            assert analysis.structure.language == 'python'
            assert len(analysis.structure.functions) > 0
            assert len(analysis.structure.classes) > 0
            assert analysis.syntax_valid
            assert analysis.documentation_score >= 0

        finally:
            os.unlink(temp_path)

        # Test language detection
        assert processor.detect_language(Path('test.py')) == 'python'
        assert processor.detect_language(Path('test.js')) == 'javascript'

        print("✓ Code Processor - PASSED")
        return True

    except Exception as e:
        print(f"✗ Code Processor - FAILED: {e}")
        return False


def test_distributed_cache():
    """Test distributed cache functionality."""
    print("Testing Distributed Cache...")

    try:
        # Test memory backend
        memory_backend = MemoryCacheBackend(max_size=100)
        assert memory_backend.set("test_key", "test_value")
        assert memory_backend.get("test_key") == "test_value"
        assert memory_backend.has_key("test_key")

        # Test distributed cache with memory backend
        cache = DistributedCache(backends=[memory_backend])

        # Test basic operations
        assert cache.set("key1", "value1")
        assert cache.get("key1") == "value1"
        assert cache.has_key("key1")

        # Test numpy array caching
        arr = np.random.rand(10, 10)
        assert cache.set("array_key", arr)
        cached_arr = cache.get("array_key")
        assert np.allclose(arr, cached_arr)

        # Test cache stats
        stats = cache.get_performance_stats()
        assert 'hits' in stats
        assert 'misses' in stats
        assert 'hit_rate' in stats

        print("✓ Distributed Cache - PASSED")
        return True

    except Exception as e:
        print(f"✗ Distributed Cache - FAILED: {e}")
        return False


def test_multimodal_fusion():
    """Test multimodal fusion system."""
    print("Testing Multimodal Fusion...")

    try:
        fusion_system = AdvancedMultimodalFusion(embedding_dim=384)

        # Create test modality embeddings
        text_emb = ModalityEmbedding(
            modality_type='text',
            embedding=np.random.rand(384),
            confidence=0.9,
            metadata={'length': 100}
        )

        table_emb = ModalityEmbedding(
            modality_type='table',
            embedding=np.random.rand(384),
            confidence=0.8,
            metadata={'rows': 10, 'cols': 5}
        )

        image_emb = ModalityEmbedding(
            modality_type='image',
            embedding=np.random.rand(384),
            confidence=0.7,
            metadata={'size': (224, 224)}
        )

        modality_embeddings = [text_emb, table_emb, image_emb]

        # Test fusion
        result = fusion_system.fuse_embeddings(modality_embeddings, 'attention')

        assert result.fused_embedding.shape[0] == 384
        assert result.fusion_confidence > 0
        assert result.fusion_method == 'attention'
        assert len(result.attention_weights) == 3
        assert len(result.modality_contributions) == 3

        # Test adaptive selector
        selector = AdaptiveFusionSelector()
        method = selector.select_fusion_method(modality_embeddings)
        assert method in ['transformer', 'attention', 'weighted', 'concat']

        print("✓ Multimodal Fusion - PASSED")
        return True

    except Exception as e:
        print(f"✗ Multimodal Fusion - FAILED: {e}")
        return False


def test_embedding_generator_integration():
    """Test embedding generator with new features."""
    print("Testing Embedding Generator Integration...")

    try:
        generator = EmbeddingGenerator(
            model_name='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
            enable_cache=True
        )

        # Test basic embedding
        emb = generator.generate_single("Hello world")
        assert emb.shape[0] == 384  # MiniLM dimension
        print("Basic embedding test passed")

        # Test structured content embedding
        structured_content = StructuredContent(
            text="This is a test document with some content.",
            tables=[{
                'headers': ['Name', 'Value'],
                'rows': [['Item1', 100], ['Item2', 200]],
                'shape': (2, 2)
            }],
            images=[{
                'path': None,  # No actual image
                'size': (100, 100),
                'type': 'png'
            }],
            code_blocks=['def test():\n    return True']
        )

        print("Created structured content, now generating multimodal embedding...")
        # This should work with fallbacks for missing components
        multimodal_emb = generator.generate_structured(structured_content)
        print(f"Generated embedding with shape: {multimodal_emb.shape}")
        assert multimodal_emb.shape[-1] == 384

        print("✓ Embedding Generator Integration - PASSED")
        return True

    except Exception as e:
        import traceback
        print(f"✗ Embedding Generator Integration - FAILED: {e}")
        traceback.print_exc()
        return False


def test_error_handling():
    """Test error handling and fallbacks."""
    print("Testing Error Handling...")

    try:
        # Test cache fallback
        cache = DistributedCache(backends=[])  # No backends
        # Should still work with basic functionality

        # Test processor fallbacks
        table_processor = AdvancedTableProcessor()
        fallback_analysis = table_processor._create_fallback_analysis(Path("nonexistent"))
        assert isinstance(fallback_analysis, TableAnalysis)

        code_processor = CodeProcessor()
        fallback_code = code_processor._create_fallback_analysis(Path("nonexistent"))
        assert isinstance(fallback_code, CodeAnalysis)

        print("✓ Error Handling - PASSED")
        return True

    except Exception as e:
        print(f"✗ Error Handling - FAILED: {e}")
        return False


def run_advanced_tests():
    """Run all advanced feature tests."""
    print("=" * 60)
    print("ADVANCED MULTIMODAL FEATURES TEST SUITE")
    print("=" * 60)

    tests = [
        test_clip_processor_enhanced,
        test_multi_clip_processor,
        test_advanced_table_processor,
        test_code_processor,
        test_distributed_cache,
        test_multimodal_fusion,
        test_embedding_generator_integration,
        test_error_handling,
    ]

    passed = 0
    failed = 0

    for test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"✗ {test_func.__name__} - CRASHED: {e}")
            failed += 1

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Tests Passed: {passed}/{len(tests)}")
    print(f"Tests Failed: {failed}/{len(tests)}")

    if failed == 0:
        print("\n🎉 ALL ADVANCED TESTS PASSED!")
        print("The system is ready for production use.")
        return True
    else:
        print(f"\n⚠️  {failed} tests failed. Please check the errors above.")
        return False


if __name__ == "__main__":
    success = run_advanced_tests()
    exit(0 if success else 1)
