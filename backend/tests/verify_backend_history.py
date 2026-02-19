import asyncio
import json
import httpx

async def test_stream_with_history():
    url = "http://localhost:8001/text/stream"
    history = "User: My favorite color is rainbow-colored sparkle.\nAI: That is a unique color."
    payload = {
        "question": "What is my favorite color?",
        "user_id": "test_user",
        "preferred_language": "en",
        "conversation_history": history
    }

    print(f"Testing stream endpoint: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("POST", url, json=payload, timeout=30.0) as response:
                if response.status_code != 200:
                    print(f"Error: Status code {response.status_code}")
                    print(await response.aread())
                    return

                print("Stream started...")
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = json.loads(line[6:])
                        if "token" in data:
                            print(data["token"], end="", flush=True)
                        elif "error" in data:
                            print(f"\nError in stream: {data['error']}")
                        elif "status" in data:
                            print(f"\nStatus: {data['status']}")
                        elif "metadata" in data:
                             print(f"\nMetadata: {data}")

                print("\nStream completed.")

        except httpx.RequestError as exc:
            print(f"An error occurred while requesting {exc.request.url!r}.")
        except Exception as exc:
            print(f"An unexpected error occurred: {exc}")

async def wait_for_backend():
    url = "http://localhost:8001/health"
    print(f"Waiting for backend at {url}...")
    async with httpx.AsyncClient() as client:
        for i in range(30):
            try:
                response = await client.get(url, timeout=2.0)
                if response.status_code == 200:
                    print("Backend is ready!")
                    return True
            except:
                pass
            print(".", end="", flush=True)
            await asyncio.sleep(1)
    print("\nBackend not ready after 30s")
    return False

if __name__ == "__main__":
    if asyncio.run(wait_for_backend()):
        asyncio.run(test_stream_with_history())
    else:
        print("Skipping test due to backend unavailability")
