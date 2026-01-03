import rtmidi
import mido
import logging

logger = logging.getLogger("maple.midi")

class MidiEngine:
    def __init__(self):
        self.midi_out = rtmidi.MidiOut()
        self.active_port_name = "None"
        self._setup_initial_port()

    def _setup_initial_port(self):
        # Default to virtual port on Linux/macOS
        try:
            self.midi_out.open_virtual_port("Maple Output")
            self.active_port_name = "Maple Output (Virtual)"
            logger.info("Initialized with virtual MIDI port: Maple Output")
        except Exception as e:
            logger.warning(f"Could not open virtual port: {e}")
            ports = self.midi_out.get_ports()
            if ports:
                self.midi_out.open_port(0)
                self.active_port_name = ports[0]
                logger.info(f"Initialized with default hardware port: {self.active_port_name}")

    def get_port_names(self):
        # We need a fresh MidiOut (or temporary) to get ports without interference
        temp_out = rtmidi.MidiOut()
        return temp_out.get_ports()

    def open_port(self, port_index):
        logger.info(f"REQUESTED: Switch to MIDI port index {port_index}")
        try:
            # Recreate MidiOut to clear any virtual ports or stuck states
            if self.midi_out:
                self.midi_out.close_port()
                del self.midi_out
            
            self.midi_out = rtmidi.MidiOut()
            ports = self.midi_out.get_ports()
            
            if 0 <= port_index < len(ports):
                self.midi_out.open_port(port_index)
                self.active_port_name = ports[port_index]
                logger.info(f"SUCCESS: Switched to hardware port: {self.active_port_name}")
                return True
            else:
                logger.error(f"Port index {port_index} invalid. Falling back to virtual.")
                self._setup_initial_port()
                return False
        except Exception as e:
            logger.error(f"FAILED to switch port: {e}")
            self.midi_out = rtmidi.MidiOut()
            self._setup_initial_port()
            return False

    def send_note_on(self, channel, note, velocity):
        if not self.midi_out: return
        # Log port name to be sure it's correct in the gen loop
        msg = mido.Message('note_on', channel=channel, note=note, velocity=velocity)
        self.midi_out.send_message(msg.bytes())

    def send_note_off(self, channel, note):
        if not self.midi_out: return
        msg = mido.Message('note_off', channel=channel, note=note)
        self.midi_out.send_message(msg.bytes())
    
    def send_cc(self, channel, control, value):
        msg = mido.Message('control_change', channel=channel, control=control, value=value)
        self.midi_out.send_message(msg.bytes())

midi_engine = MidiEngine()
