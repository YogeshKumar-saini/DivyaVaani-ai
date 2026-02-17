import requests
import json
import time
import os

# Configuration
BASE_URL = "http://localhost:8000"
EMAIL = f"test_e2e_{int(time.time())}@example.com"
PASSWORD = "TestPassword@123"
FULL_NAME = "E2E Test User"

def print_result(name, success, details=""):
    status = "PASS" if success else "FAIL"
    color = "\033[92m" if success else "\033[91m"
    reset = "\033[0m"
    print(f"{color}[{status}] {name}{reset} {details}")

def test_public_endpoints():
    print("\n--- Testing Public Endpoints ---")
    
    # Health check
    try:
        res = requests.get(f"{BASE_URL}/health")
        print_result("Health Check", res.status_code == 200, f"Status: {res.status_code}")
    except Exception as e:
        print_result("Health Check", False, str(e))

    # Root
    try:
        res = requests.get(f"{BASE_URL}/")
        print_result("Root Endpoint", res.status_code == 200, f"Status: {res.status_code}")
    except Exception as e:
        print_result("Root Endpoint", False, str(e))

def test_auth_flow():
    print("\n--- Testing Auth Flow ---")
    token = None
    
    # Register
    try:
        payload = {
            "email": EMAIL,
            "password": PASSWORD,
            "full_name": FULL_NAME,
            "phone_number": "1234567890" # Optional but good to test
        }
        res = requests.post(f"{BASE_URL}/auth/register", json=payload)
        success = res.status_code in [200, 201]
        print_result("Register", success, f"Status: {res.status_code}")
    except Exception as e:
        print_result("Register", False, str(e))

    # Login
    try:
        payload = {
            "email": EMAIL,
            "password": PASSWORD
        }
        res = requests.post(f"{BASE_URL}/auth/token", json=payload) # JSON for backend endpoint
        success = res.status_code == 200
        if success:
            data = res.json()
            token = data.get("access_token")
            print_result("Login", True, "Token received")
        else:
            print_result("Login", False, f"Status: {res.status_code} - {res.text}")
    except Exception as e:
        print_result("Login", False, str(e))
        
    # Get Current User (Me)
    if token:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            success = res.status_code == 200
            print_result("Get Profile", success, f"User: {res.json().get('email')}" if success else f"Status: {res.status_code}")
        except Exception as e:
            print_result("Get Profile", False, str(e))

    return token

def test_text_query(token):
    print("\n--- Testing Text Query ---")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    try:
        payload = {
            "question": "What is Dharma?",
            "preferred_language": "en"
        }
        res = requests.post(f"{BASE_URL}/text/", json=payload, headers=headers)
        success = res.status_code == 200
        details = ""
        if success:
            data = res.json()
            details = f"Answer length: {len(data.get('answer', ''))}"
        else:
            details = f"Status: {res.status_code} - {res.text}"
            
        print_result("Text Q&A", success, details)
    except Exception as e:
        print_result("Text Q&A", False, str(e))

def test_voice_endpoints(token):
    print("\n--- Testing Voice Endpoints ---")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # Create a dummy audio file
    with open("test_audio.wav", "wb") as f:
        f.write(os.urandom(1000)) # Random bytes to simulate audio file
        
    files = {'audio_file': ('test_audio.wav', open('test_audio.wav', 'rb'), 'audio/wav')}
    
    # Test STT (Speech to Text)
    try:
        # Note: This might fail if the STT engine expects valid audio format. 
        # But we check if it reaches the handler.
        res = requests.post(f"{BASE_URL}/voice/stt/", files=files, headers=headers)
        # 400 or 500 is expected for random bytes, but 404 means endpoint missing
        exists = res.status_code != 404
        print_result("STT Endpoint Exists", exists, f"Status: {res.status_code}")
    except Exception as e:
        print_result("STT Endpoint", False, str(e))
        
    # Re-open file for next request
    files = {'audio_file': ('test_audio.wav', open('test_audio.wav', 'rb'), 'audio/wav')}

    # Test Voice Query
    try:
        res = requests.post(f"{BASE_URL}/voice/", files=files, headers=headers)
        exists = res.status_code != 404
        print_result("Voice Query Endpoint Exists", exists, f"Status: {res.status_code}")
    except Exception as e:
        print_result("Voice Query Endpoint", False, str(e))
        
    # Cleanup
    os.remove("test_audio.wav")

    # Test TTS (Text to Speech)
    try:
        data = {
            "text": "Om Namah Shivaya",
            "language": "en",
            "voice": "default"
        }
        res = requests.post(f"{BASE_URL}/voice/tts/", data=data, headers=headers)
        success = res.status_code == 200
        print_result("TTS Endpoint", success, f"Content-Type: {res.headers.get('content-type')}" if success else f"Status: {res.status_code}")
    except Exception as e:
        print_result("TTS Endpoint", False, str(e))

def test_conversation(token):
    print("\n--- Testing Conversation ---")
    if not token:
        print_result("Conversation Tests", False, "Skipped due to no token")
        return

    headers = {"Authorization": f"Bearer {token}"} 
    
    # Text conversation
    try:
        payload = {
            "query": "Explain Karma Yoga",
            "user_id": "test_user_123"
        }
        res = requests.post(f"{BASE_URL}/conversation/text", json=payload, headers=headers)
        success = res.status_code == 200
        print_result("Conversation Text", success, f"Status: {res.status_code}")
    except Exception as e:
        print_result("Conversation Text", False, str(e))

if __name__ == "__main__":
    print(f"Starting E2E Tests on {BASE_URL}")
    test_public_endpoints()
    token = test_auth_flow()
    test_text_query(token)
    test_voice_endpoints(token)
    test_conversation(token)
    print("\nE2E Tests Completed.")
