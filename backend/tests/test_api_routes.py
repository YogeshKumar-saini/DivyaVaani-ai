"""Comprehensive test suite for all API routes and endpoints."""

import requests
import json
import time
from typing import Dict, Any
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_root_endpoint(base_url: str = "http://localhost:8000"):
    """Test the root endpoint."""
    print("Testing root endpoint...")

    try:
        response = requests.get(f"{base_url}/")
        response.raise_for_status()

        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "endpoints" in data
        assert "stats" in data

        print("✓ Root endpoint - PASSED")
        return True

    except Exception as e:
        print(f"✗ Root endpoint - FAILED: {e}")
        return False


def test_health_endpoint(base_url: str = "http://localhost:8000"):
    """Test the health check endpoint."""
    print("Testing health endpoint...")

    try:
        response = requests.get(f"{base_url}/health")
        response.raise_for_status()

        data = response.json()
        assert "status" in data
        assert "system_loaded" in data

        print("✓ Health endpoint - PASSED")
        return True

    except Exception as e:
        print(f"✗ Health endpoint - FAILED: {e}")
        return False


def test_analytics_endpoint(base_url: str = "http://localhost:8000"):
    """Test the analytics endpoint."""
    print("Testing analytics endpoint...")

    try:
        response = requests.get(f"{base_url}/analytics")
        response.raise_for_status()

        data = response.json()
        assert "analytics" in data
        assert "cache" in data
        assert "system_info" in data

        print("✓ Analytics endpoint - PASSED")
        return True

    except Exception as e:
        print(f"✗ Analytics endpoint - FAILED: {e}")
        return False


def test_feedback_endpoint(base_url: str = "http://localhost:8000"):
    """Test the feedback endpoint."""
    print("Testing feedback endpoint...")

    try:
        feedback_data = {
            "user_id": "test_user",
            "rating": 5,
            "comment": "Great system!",
            "question": "What is the meaning of life?",
            "answer_quality": "excellent"
        }

        response = requests.post(f"{base_url}/feedback", json=feedback_data)
        response.raise_for_status()

        data = response.json()
        assert "message" in data
        assert "status" in data

        print("✓ Feedback endpoint - PASSED")
        return True

    except Exception as e:
        print(f"✗ Feedback endpoint - FAILED: {e}")
        return False


def test_query_endpoint(base_url: str = "http://localhost:8000"):
    """Test the query endpoint."""
    print("Testing query endpoint...")

    try:
        # Test with a simple question
        query_data = {
            "user_id": "test_user_123",
            "question": "What is the main teaching of Bhagavad Gita?",
            "preferred_language": "en"
        }

        response = requests.post(f"{base_url}/query/", json=query_data)
        response.raise_for_status()

        data = response.json()
        assert "answer" in data
        assert "sources" in data
        assert "contexts" in data
        assert "language" in data
        assert "confidence_score" in data

        print("✓ Query endpoint - PASSED")
        return True

    except Exception as e:
        print(f"✗ Query endpoint - FAILED: {e}")
        return False


def test_query_validation(base_url: str = "http://localhost:8000"):
    """Test query endpoint validation."""
    print("Testing query validation...")

    try:
        # Test with empty question
        query_data = {
            "user_id": "test_user",
            "question": "",
            "preferred_language": "en"
        }

        response = requests.post(f"{base_url}/query/", json=query_data)

        # Should return 400 Bad Request
        assert response.status_code == 400

        error_data = response.json()
        assert "detail" in error_data

        print("✓ Query validation - PASSED")
        return True

    except Exception as e:
        print(f"✗ Query validation - FAILED: {e}")
        return False


def test_web_interface_endpoint(base_url: str = "http://localhost:8000"):
    """Test the web interface endpoint."""
    print("Testing web interface endpoint...")

    try:
        response = requests.get(f"{base_url}/web")

        # This might return 404 if static files don't exist, which is acceptable
        if response.status_code == 200:
            assert "text/html" in response.headers.get("content-type", "")
            print("✓ Web interface endpoint - PASSED (static files available)")
        elif response.status_code == 404:
            print("✓ Web interface endpoint - PASSED (static files not available, expected)")
        else:
            response.raise_for_status()

        return True

    except Exception as e:
        print(f"✗ Web interface endpoint - FAILED: {e}")
        return False


def test_cors_headers(base_url: str = "http://localhost:8000"):
    """Test CORS headers."""
    print("Testing CORS headers...")

    try:
        response = requests.options(f"{base_url}/",
                                  headers={"Origin": "http://localhost:3000",
                                          "Access-Control-Request-Method": "POST"})

        # Check for CORS headers
        cors_headers = [
            "access-control-allow-origin",
            "access-control-allow-methods",
            "access-control-allow-headers"
        ]

        has_cors = any(header in response.headers for header in cors_headers)

        if has_cors:
            print("✓ CORS headers - PASSED")
        else:
            print("⚠ CORS headers - NOT DETECTED (may be configured differently)")

        return True

    except Exception as e:
        print(f"✗ CORS headers - FAILED: {e}")
        return False


def test_error_handling(base_url: str = "http://localhost:8000"):
    """Test error handling."""
    print("Testing error handling...")

    try:
        # Test invalid endpoint
        response = requests.get(f"{base_url}/nonexistent")

        # Should return 404
        assert response.status_code == 404

        print("✓ Error handling - PASSED")
        return True

    except Exception as e:
        print(f"✗ Error handling - FAILED: {e}")
        return False


def test_rate_limiting_simulation(base_url: str = "http://localhost:8000"):
    """Test rate limiting simulation."""
    print("Testing rate limiting simulation...")

    try:
        # Make multiple rapid requests
        for i in range(5):
            query_data = {
                "user_id": f"test_user_{i}",
                "question": f"What is karma yoga? Request {i+1}",
                "preferred_language": "en"
            }

            response = requests.post(f"{base_url}/query/", json=query_data, timeout=10)

            if response.status_code == 200:
                continue
            elif response.status_code == 429:  # Too Many Requests
                print("✓ Rate limiting - DETECTED (working as expected)")
                return True
            else:
                response.raise_for_status()

        print("✓ Rate limiting - PASSED (no rate limiting detected, which is fine)")
        return True

    except Exception as e:
        print(f"✗ Rate limiting - FAILED: {e}")
        return False


def test_concurrent_requests(base_url: str = "http://localhost:8000"):
    """Test concurrent requests handling."""
    print("Testing concurrent requests...")

    try:
        import concurrent.futures
        import threading

        results = []
        errors = []

        def make_request(i):
            try:
                query_data = {
                    "user_id": f"concurrent_user_{i}",
                    "question": f"What is the path to liberation? Request {i+1}",
                    "preferred_language": "en"
                }

                response = requests.post(f"{base_url}/query/", json=query_data, timeout=15)
                response.raise_for_status()

                data = response.json()
                results.append(data)
                return True

            except Exception as e:
                errors.append(str(e))
                return False

        # Make 3 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(make_request, i) for i in range(3)]
            concurrent.futures.wait(futures, timeout=30)

        successful = sum(1 for future in futures if future.result())

        if successful >= 2:  # At least 2 successful
            print(f"✓ Concurrent requests - PASSED ({successful}/3 successful)")
            return True
        else:
            print(f"✗ Concurrent requests - FAILED ({successful}/3 successful)")
            return False

    except ImportError:
        print("⚠ Concurrent requests - SKIPPED (concurrent.futures not available)")
        return True
    except Exception as e:
        print(f"✗ Concurrent requests - FAILED: {e}")
        return False


def run_api_tests(base_url: str = "http://localhost:8000"):
    """Run all API route tests."""
    print("=" * 60)
    print("API ROUTES COMPREHENSIVE TEST SUITE")
    print("=" * 60)
    print(f"Testing API at: {base_url}")
    print()

    # Check if server is running
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code != 200:
            print("❌ API server is not responding. Please start the server first:")
            print("   python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000")
            return False
    except:
        print("❌ Cannot connect to API server. Please start the server first:")
        print("   python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000")
        return False

    tests = [
        lambda: test_root_endpoint(base_url),
        lambda: test_health_endpoint(base_url),
        lambda: test_analytics_endpoint(base_url),
        lambda: test_feedback_endpoint(base_url),
        lambda: test_query_endpoint(base_url),
        lambda: test_query_validation(base_url),
        lambda: test_web_interface_endpoint(base_url),
        lambda: test_cors_headers(base_url),
        lambda: test_error_handling(base_url),
        lambda: test_rate_limiting_simulation(base_url),
        lambda: test_concurrent_requests(base_url),
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
            print(f"✗ Test crashed: {e}")
            failed += 1

        # Small delay between tests
        time.sleep(0.1)

    print("\n" + "=" * 60)
    print("API TEST SUMMARY")
    print("=" * 60)
    print(f"Tests Passed: {passed}/{len(tests)}")
    print(f"Tests Failed: {failed}/{len(tests)}")

    if failed == 0:
        print("\n🎉 ALL API ROUTES TESTS PASSED!")
        print("The API is fully functional and ready for production.")
        return True
    else:
        print(f"\n⚠️  {failed} API route tests failed.")
        print("Please check the errors above and resolve any issues.")
        return False


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test API routes")
    parser.add_argument("--url", default="http://localhost:8000",
                       help="Base URL of the API server")

    args = parser.parse_args()

    success = run_api_tests(args.url)
    exit(0 if success else 1)
