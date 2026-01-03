import asyncio
import websockets
import json
import sys

async def test_integration():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket")
        
        # 1. Wait for Init
        response = await websocket.recv()
        data = json.loads(response)
        if data['type'] == 'init':
            print("Received INIT:", len(data['lobes']), "lobes")
        else:
            print("FAILED: Did not receive INIT")
            sys.exit(1)

        # 2. Receive some pulses (optional, just to see flow)
        try:
            response = await asyncio.wait_for(websocket.recv(), timeout=1.0)
            data = json.loads(response)
            if data['type'] == 'pulse':
                print("Received PULSE")
        except asyncio.TimeoutError:
            print("No pulse received in 1s (might be normal if prob is low)")

        # 3. Send Update
        update_msg = {
            "type": "update_lobe",
            "lobe": {
                "id": 0,
                "probability": 0.99
            }
        }
        await websocket.send(json.dumps(update_msg))
        print("Sent UPDATE")

        # 4. Wait for Broadcast confirmation
        while True:
            response = await websocket.recv()
            data = json.loads(response)
            if data['type'] == 'state_update':
                if data['lobe']['id'] == 0 and data['lobe']['probability'] == 0.99:
                    print("Received correct STATE_UPDATE")
                    break
            elif data['type'] == 'pulse':
                continue # ignore pulses while waiting
        
        print("Integration Test PASSED")

if __name__ == "__main__":
    asyncio.run(test_integration())
