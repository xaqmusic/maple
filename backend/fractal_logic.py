import random
import time
import math
import logging
from dataclasses import dataclass
from typing import List, Dict

logger = logging.getLogger("maple.fractal")

@dataclass
class Lobe:
    id: int
    name: str
    angle: float  # Angle in degrees for the UI
    instrument_channel: int
    active: bool = True
    scale: List[int] = None  # List of midi notes
    
    # Pulse parameters
    pulse_speed: float = 1.0
    probability: float = 0.5
    
    def __post_init__(self):
        if self.scale is None:
            # Default C Major pentatonic
            self.scale = [60, 62, 64, 67, 69]

class FractalLogic:
    def __init__(self):
        self.reset_engine()

    def reset_engine(self):
        """Resets all internal phases and timers for a clean start."""
        self.last_tick = time.time()
        self.last_stem_pulse = 0
        # Clear all dynamic phase attributes
        for attr in list(vars(self).keys()):
            if attr.startswith("lobe_phase_"):
                setattr(self, attr, 0.0)
        logger.info("FractalLogic: Engine Reset")
        
    def tick(self, tempo: int, lobes: List, global_scale: List[int]):
        # Use only the global scale. Empty scale means silence.
        scale = global_scale if global_scale is not None else []
            
        events = []
        now = time.time()
        dt = now - self.last_tick
        self.last_tick = now
        
        # Stem Pulse Logic
        pulse_interval = 60.0 / tempo
        if not hasattr(self, 'last_stem_pulse'):
            self.last_stem_pulse = 0
            
        if now - self.last_stem_pulse >= pulse_interval:
            self.last_stem_pulse = now
            events.append({
                "type": "stem_pulse",
                "timestamp": now
            })

        # Lobe Generation Logic
        for lobe in lobes:
            if not lobe.active:
                continue
            
            # Phase Tracking for rhythm
            phase_key = f"lobe_phase_{lobe.id}"
            if not hasattr(self, phase_key):
                setattr(self, phase_key, 0.0)
            
            div = max(0.1, lobe.division)
            beat_interval = (60.0 / tempo) / div
            
            current_phase = getattr(self, phase_key)
            new_phase = current_phase + dt
            
            if new_phase >= beat_interval:
                setattr(self, phase_key, new_phase % beat_interval)
                
                # Musical choice: Use probability to decide if we play this specific beat
                if scale and random.random() < lobe.probability:
                    base_note = random.choice(scale)
                    note = max(0, min(127, base_note + lobe.transpose))
                    
                    velocity = random.randint(70, 110)
                    duration = beat_interval * 0.8
                    
                    events.append({
                        "type": "note",
                        "lobe_id": lobe.id,
                        "channel": lobe.instrument_channel,
                        "note": note,
                        "velocity": velocity,
                        "duration": duration
                    })
            else:
                setattr(self, phase_key, new_phase)
                
        return events

fractal_logic = FractalLogic()
