from dataclasses import dataclass, field
from typing import List, Dict, Optional
import logging

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

@dataclass
class AppState:
    lobes: List[LobeState] = field(default_factory=list)
    tempo: int = 120
    selected_midi_port: int = 0
    selected_notes: List[int] = None
    playing: bool = False

    def __post_init__(self):
        if self.selected_notes is None:
            self.selected_notes = [60, 62, 64, 67, 69] # Default C Pentatonic

    def to_dict(self):
        return {
            "tempo": self.tempo,
            "selected_midi_port": self.selected_midi_port,
            "lobes": [vars(l) for l in self.lobes],
            "selected_notes": self.selected_notes,
            "playing": self.playing,
        }

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

state_manager = StateManager()
