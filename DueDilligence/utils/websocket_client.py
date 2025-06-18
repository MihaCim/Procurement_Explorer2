import asyncio
import websockets
import urllib.parse

async def receive_profiles(company_name):
    encoded_company_name = urllib.parse.quote(company_name)  # Ensure URL safety
    uri = f"ws://127.0.0.1:8055/ws/profile/{encoded_company_name}"
    print(f"Connecting to WebSocket: {uri}")
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to WebSocket for {company_name}")
            while True:
                try:
                    data = await websocket.recv()
                    print("Received:", data)
                except websockets.exceptions.ConnectionClosed:
                    print("WebSocket connection closed by server.")
                    break
    except websockets.exceptions.ConnectionClosedError:
        print("WebSocket connection error.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    company_name = input("Enter company name: ").strip()
    if company_name:
        asyncio.run(receive_profiles(company_name))
    else:
        print("Company name cannot be empty.")
