import requests
import time
import sys

# User provided IP
SERVER_IP = "54.84.227.171"
BACKEND_URL = f"http://{SERVER_IP}:8000"
FRONTEND_URL = f"http://{SERVER_IP}:3000"

def test_endpoint(method, url, data=None, expected_status=[200]):
    if isinstance(expected_status, int):
        expected_status = [expected_status]
        
    print(f"Testing {method} {url}...", end=" ")
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            print("Unsupported method")
            return False
        
        if response.status_code in expected_status:
            print(f"SUCCESS ({response.status_code})")
            return True
        else:
            print(f"FAILED ({response.status_code})")
            print(f"Response: {response.text[:200]}...") 
            return False
    except requests.exceptions.ConnectionError:
        print("FAILED (Connection Error) - Is the port open in Security Group?")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def run_tests():
    print(f"--- Verifying Remote Deployment on {SERVER_IP} ---\n")
    
    # 1. Frontend Check
    print("Checking Frontend...")
    if test_endpoint("GET", FRONTEND_URL):
        print("Frontend is accessible!")
    else:
        print("Frontend NOT accessible.")

    # 2. Backend Health Check
    print("\nChecking Backend...")
    if test_endpoint("GET", f"{BACKEND_URL}/health"):
        print("Backend is healthy!")
    else:
        print("Backend NOT accessible.")
        # If health fails, other tests might fail too, but we continue
    
    # 3. Backend Functional Tests
    print("\n--- Running Backend Route Tests ---\n")
    test_endpoint("GET", f"{BACKEND_URL}/")
    test_endpoint("GET", f"{BACKEND_URL}/metrics")
    test_endpoint("GET", f"{BACKEND_URL}/analytics")

    # Text Query
    payload_text = {
        "question": "What is the meaning of life?",
        "preferred_language": "en"
    }
    test_endpoint("POST", f"{BACKEND_URL}/text", data=payload_text)

    # Voice Routes
    test_endpoint("GET", f"{BACKEND_URL}/voice/stt/languages")
    
    print("\n--- Verification Completed ---\n")

if __name__ == "__main__":
    run_tests()
