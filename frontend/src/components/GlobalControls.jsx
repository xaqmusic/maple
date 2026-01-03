import { Settings, Music, Activity, Play, Square } from 'lucide-react';

const GlobalControls = ({ state, ports, onUpdate }) => {
    if (!state) return null;

    const handleUpdate = (updates) => {
        onUpdate(updates);
    };

    return (
        <div className="bg-maple-dark/90 backdrop-blur-xl border border-maple-leaf/20 p-5 rounded-2xl w-64 text-maple-leaf shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-maple-leaf/10 pb-3">
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 opacity-60" />
                    <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">Global</h2>
                </div>

                {/* Play / Stop Toggle */}
                <button
                    onClick={() => handleUpdate({ playing: !state.playing })}
                    className={`
                        flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all duration-300
                        ${state.playing
                            ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                            : 'bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20'}
                    `}
                >
                    {state.playing ? (
                        <><Square className="w-3 h-3 fill-current" /> Stop</>
                    ) : (
                        <><Play className="w-3 h-3 fill-current" /> Play</>
                    )}
                </button>
            </div>

            {/* MIDI Output Selection */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-tighter opacity-50">
                    <Music className="w-3 h-3" />
                    <label>MIDI Output</label>
                </div>
                <select
                    value={state.selected_midi_port}
                    onChange={(e) => handleUpdate({ selected_midi_port: parseInt(e.target.value) })}
                    className="w-full bg-black/40 border border-maple-leaf/20 rounded-md p-2 text-xs focus:outline-none focus:border-maple-leaf/50 transition-colors"
                >
                    {ports.map((port, idx) => (
                        <option key={idx} value={idx}>{port}</option>
                    ))}
                    {ports.length === 0 && <option disabled>No MIDI Ports Found</option>}
                </select>
            </div>

            {/* Tempo Control */}
            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-tighter opacity-50">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        <label>Tempo (BPM)</label>
                    </div>
                    <span className="text-maple-leaf font-mono">{state.tempo}</span>
                </div>
                <input
                    type="range"
                    min="20" max="200" step="1"
                    value={state.tempo}
                    onChange={(e) => handleUpdate({ tempo: parseInt(e.target.value) })}
                    className="w-full accent-maple-leaf h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer hover:accent-maple-vein transition-all"
                />
            </div>

            <div className="pt-4 opacity-30 text-[9px] italic flex justify-center border-t border-maple-leaf/5">
                Maple v1.0 • Generative Ambient
            </div>
        </div>
    );
};

export default GlobalControls;
