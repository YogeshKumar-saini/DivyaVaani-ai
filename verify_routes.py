import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, expected_status=200):
    url = f"{BASE_URL}{endpoint}"
    print(f"Testing {method} {url}...", end=" ")
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        else:
            print("Unsupported method")
            return False
        
        if response.status_code == expected_status:
            print(f"SUCCESS ({response.status_code})")
            return True
        else:
            print(f"FAILED ({response.status_code})")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def run_tests():
    print("Waiting for backend to be ready...")
    for _ in range(30):
        if test_endpoint("GET", "/health", expected_status=200):
            break
        time.sleep(2)
    else:
        print("Backend did not become ready in time.")
        return

    print("\n--- Running Route Tests ---\n")
    
    # 1. Root Endpoint
    test_endpoint("GET", "/")

    # 2. Health Check
    test_endpoint("GET", "/health")

    # 3. Metrics (Protected, likely 403 or 401 if auth needed, but let's see)
    # Assuming basic access for now or public
    test_endpoint("GET", "/metrics", expected_status=200)

    # 4. Analytics
    test_endpoint("GET", "/analytics")

    # 5. Text Query (POST)
    payload = {
        "query": "What is the meaning of life according to Gita?",
        "language": "en"
    }
    test_endpoint("POST", "/text", data=payload)

    # 6. Stream Query (POST) - if applicable
    # test_endpoint("POST", "/text/stream", data=payload) # Streaming might need special handling

    # 7. Voice STT (Mock/Check existence)
    # This requires file upload, might skip for simple script or use dummy file if needed.
    # checking GET languages first
    test_endpoint("GET", "/voice/stt/languages")

    # 8. Voice TTS Voices
    test_endpoint("GET", "/voice/tts/voices")

    # 9. Feedback
    feedback_payload = {
        "type": "general",
        "content": "Automated test feedback"
    }
    test_endpoint("POST", "/feedback", data=feedback_payload)

if __name__ == "__main__":
    run_tests()
