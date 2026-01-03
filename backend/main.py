from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import logging
from midi_engine import midi_engine
from fractal_logic import fractal_logic
from state_manager import state_manager, AppState
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("maple.main")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    # Start the generation loop
    asyncio.create_task(generation_loop())

async def generation_loop():
    logger.info("Starting generation loop")
    was_playing = False
    
    while True:
        is_playing = state_manager.state.playing
        
        # Detect transition from Stopped to Playing
        if is_playing and not was_playing:
            logger.info("Playback STARTED: Resetting Engine")
            fractal_logic.reset_engine()
        
        was_playing = is_playing

        if not is_playing:
            fractal_logic.last_tick = time.time() 
            await asyncio.sleep(0.1)
            continue

        try:
            # Pass global tempo, lobes, and scale from state_manager to tick
            events = fractal_logic.tick(
                state_manager.state.tempo, 
                state_manager.state.lobes,
                state_manager.state.selected_notes
            )
            
            if events:
                for event in events:
                    if event['type'] == 'note':
                        midi_engine.send_note_on(event['channel'], event['note'], event['velocity'])
                        
                        logger.info(f"Broadcasting Note: {event['note']} for Lobe {event['lobe_id']} [Port: {midi_engine.active_port_name}]")
                        await manager.broadcast({
                            "type": "pulse",
                            "lobe_id": event['lobe_id'],
                            "note": event['note']
                        })
                        
                        asyncio.create_task(schedule_note_off(event['channel'], event['note'], event['duration']))
                    
                    elif event['type'] == 'stem_pulse':
                        await manager.broadcast({
                            "type": "stem_pulse",
                            "timestamp": event['timestamp']
                        })

        except Exception as e:
            logger.error(f"Error in generation loop: {e}", exc_info=True)
            await asyncio.sleep(1.0) # Backoff briefly on error

        await asyncio.sleep(0.02) # Higher resolution for tempo

async def schedule_note_off(channel, note, duration):
    await asyncio.sleep(duration)
    midi_engine.send_note_off(channel, note)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial full state and port list
        await websocket.send_json({
            "type": "init",
            "state": state_manager.state.to_dict(),
            "ports": midi_engine.get_port_names()
        })

        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg['type'] == 'update_lobe':
                lobe = state_manager.update_lobe(msg['lobe']['id'], msg['lobe'])
                if lobe:
                    logger.info(f"Updated Lobe {lobe.id}")
                    # Broadcast update to all clients to keep them in sync
                    await manager.broadcast({
                        "type": "state_update",
                        "lobe": vars(lobe)
                    })

            elif msg['type'] == 'update_global':
                updates = msg['updates']
                logger.info(f"Received global update request: {updates}")
                state_manager.update_global(updates)
                
                # Handle MIDI port switching specifically if it changed
                if 'selected_midi_port' in updates:
                    p_idx = updates['selected_midi_port']
                    logger.info(f"Triggering MIDI port switch to index {p_idx}")
                    midi_engine.open_port(p_idx)
                
                if 'playing' in updates and updates['playing'] is False:
                    logger.info("Playback STOPPED: Triggering All Notes Off")
                    midi_engine.all_notes_off()
                
                await manager.broadcast({
                    "type": "global_update",
                    "updates": updates
                })

            elif msg['type'] == 'save_state':
                success = state_manager.save_to_file("maple_state.json")
                logger.info(f"State save {'successful' if success else 'failed'}")

            elif msg['type'] == 'load_state':
                new_state = state_manager.load_from_file("maple_state.json")
                if new_state:
                    logger.info("State loaded successfully. Broadcasting updates.")
                    # Broadcast full init to refresh everyone
                    await manager.broadcast({
                        "type": "init",
                        "state": state_manager.state.to_dict(),
                        "ports": midi_engine.get_port_names()
                    })
                    
                    # Specifically trigger MIDI port switch if it changed in loaded state
                    midi_engine.open_port(state_manager.state.selected_midi_port)

            elif msg['type'] == 'apply_full_state':
                state_data = msg['state']
                logger.info("Applying full state from client")
                
                # Preserve current playing state
                current_playing = state_manager.state.playing
                
                state_manager.state = AppState.from_dict(state_data)
                state_manager.state.playing = current_playing
                
                # Broadcast back to all to sync up
                await manager.broadcast({
                    "type": "init",
                    "state": state_manager.state.to_dict(),
                    "ports": midi_engine.get_port_names()
                })
                # Re-open midi port just in case it changed
                midi_engine.open_port(state_manager.state.selected_midi_port)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}", exc_info=True)
        manager.disconnect(websocket)

@app.get("/ports")
def get_ports():
    return midi_engine.get_port_names()
