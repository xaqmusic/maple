from dataclasses import dataclass, field
from typing import List, Dict, Optional
import logging
import json
import os

logger = logging.getLogger("maple.state")

@dataclass
class LobeState:
    id: int
    name: str
    active: bool = True
    probability: float = 0.5
    instrument_channel: int = 0
    division: float = 1.0  # 1.0 = Quarter, 0.5 = Half, 2.0 = 8th, etc.
    transpose: int = 0  # Semitones offset
    velocity: int = 100
    register: str = "all"  # all, low, high

    @classmethod
    def from_dict(cls, data: dict):
        from dataclasses import fields
        valid_keys = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in valid_keys})

@dataclass
class AppState:
    lobes: List[LobeState] = field(default_factory=list)
    tempo: int = 120
    selected_midi_port: int = 0
    selected_notes: List[int] = None
    playing: bool = False

    def __post_init__(self):
        if self.selected_notes is None:
            self.selected_notes = [60, 65, 74, 76, 81, 83] # C, F (low) | D, E, A, B (high)

    def to_dict(self):
        return {
            "tempo": self.tempo,
            "selected_midi_port": self.selected_midi_port,
            "lobes": [vars(l) for l in self.lobes],
            "selected_notes": self.selected_notes,
            "playing": self.playing,
        }

    @classmethod
    def from_dict(cls, data: dict):
        from dataclasses import fields
        valid_keys = {f.name for f in fields(cls)}
        
        lobes_data = data.get("lobes", [])
        lobes = [LobeState.from_dict(l) for l in lobes_data]
        
        # Prepare filtered keys for AppState
        filtered_data = {k: v for k, v in data.items() if k in valid_keys and k != 'lobes'}
        return cls(lobes=lobes, **filtered_data)

class StateManager:
    def __init__(self):
        self.state = AppState(
            lobes=[
                LobeState(0, "Left Bottom", instrument_channel=0),
                LobeState(1, "Left Top", instrument_channel=0),
                LobeState(2, "Center", instrument_channel=0),
                LobeState(3, "Right Top", instrument_channel=0),
                LobeState(4, "Right Bottom", instrument_channel=0),
            ]
        )

    def update_lobe(self, lobe_id: int, updates: dict):
        if 0 <= lobe_id < len(self.state.lobes):
            lobe = self.state.lobes[lobe_id]
            for key, value in updates.items():
                if hasattr(lobe, key):
                    setattr(lobe, key, value)
            return lobe
        return None

    def update_global(self, updates: dict):
        for key, value in updates.items():
            if hasattr(self.state, key):
                setattr(self.state, key, value)
        return self.state

    def save_to_file(self, filepath: str):
        try:
            with open(filepath, 'w') as f:
                json.dump(self.state.to_dict(), f, indent=4)
            logger.info(f"State saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Failed to save state: {e}")
            return False

    def load_from_file(self, filepath: str):
        try:
            if not os.path.exists(filepath):
                logger.warning(f"State file {filepath} not found")
                return None
            with open(filepath, 'r') as f:
                data = json.load(f)
            self.state = AppState.from_dict(data)
            logger.info(f"State loaded from {filepath}")
            return self.state
        except Exception as e:
            logger.error(f"Failed to load state: {e}")
            return None

state_manager = StateManager()
