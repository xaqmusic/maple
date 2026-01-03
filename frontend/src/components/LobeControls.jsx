import React from 'react';

const LobeControls = ({ lobe, onUpdate, onClose }) => {
    if (!lobe) return null;

    const handleChange = (field, value) => {
        onUpdate({ ...lobe, [field]: value });
    };

    return (
        <div className="flex flex-col h-full text-maple-leaf">
            <div className="flex justify-between items-center border-b border-maple-leaf/30 pb-4 mb-6">
                <h3 className="text-xl font-light uppercase tracking-[0.2em]">{lobe.name}</h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-maple-leaf/10 rounded-full transition-colors group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-maple-leaf/30 transition-colors">
                    <label className="text-sm font-medium opacity-70 tracking-wide uppercase">Active State</label>
                    <button
                        onClick={() => handleChange('active', !lobe.active)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${lobe.active ? 'bg-maple-leaf' : 'bg-gray-700'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${lobe.active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold opacity-50 uppercase tracking-widest">Rhythmic Subdivision</label>
                            <span className="text-xs font-mono">{lobe.division === 0.25 ? '1/1' : lobe.division === 0.5 ? '1/2' : lobe.division === 1 ? '1/4' : lobe.division === 2 ? '1/8' : '1/16'}</span>
                        </div>
                        <select
                            value={lobe.division}
                            onChange={(e) => handleChange('division', parseFloat(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-maple-leaf/50 outline-none transition-colors appearance-none"
                        >
                            <option value="0.25">Whole Note</option>
                            <option value="0.5">Half Note</option>
                            <option value="1">Quarter Note</option>
                            <option value="2">8th Note</option>
                            <option value="4">16th Note</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-xs font-bold opacity-50 uppercase tracking-widest">Trigger Probability</label>
                            <span className="text-xs font-mono">{Math.round(lobe.probability * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="1" step="0.01"
                            value={lobe.probability}
                            onChange={(e) => handleChange('probability', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-maple-leaf"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-xs font-bold opacity-50 uppercase tracking-widest">Pitch Transpose</label>
                            <span className={`text-xs font-mono ${lobe.transpose !== 0 ? 'text-maple-vein' : 'opacity-50'}`}>
                                {lobe.transpose > 0 ? `+${lobe.transpose}` : lobe.transpose} ST
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-36" max="36" step="1"
                            value={lobe.transpose}
                            onChange={(e) => handleChange('transpose', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-maple-leaf"
                        />
                        <div className="flex justify-between mt-2 text-[10px] opacity-30 font-mono">
                            <span>-3 OCT</span>
                            <span>0</span>
                            <span>+3 OCT</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-xs font-bold opacity-50 uppercase tracking-widest">Velocity</label>
                            <span className="text-xs font-mono">{lobe.velocity || 100}</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="127" step="1"
                            value={lobe.velocity || 100}
                            onChange={(e) => handleChange('velocity', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-maple-leaf"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold opacity-50 uppercase tracking-widest">Register</label>
                            <span className="text-xs font-mono lowercase">{lobe.register || 'all'}</span>
                        </div>
                        <select
                            value={lobe.register || 'all'}
                            onChange={(e) => handleChange('register', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-maple-leaf/50 outline-none transition-colors appearance-none"
                        >
                            <option value="all">All Notes</option>
                            <option value="low">Low (Octave 1)</option>
                            <option value="high">High (Octave 2)</option>
                        </select>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <label className="text-xs font-bold opacity-50 uppercase tracking-widest block mb-4">MIDI Output</label>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-maple-leaf/20 flex items-center justify-center text-maple-leaf text-lg font-mono">
                                    {lobe.instrument_channel + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold opacity-70 mb-1">Channel</div>
                                    <select
                                        value={lobe.instrument_channel}
                                        onChange={(e) => handleChange('instrument_channel', parseInt(e.target.value))}
                                        className="w-full bg-black/40 border border-white/10 rounded-md p-1 text-[10px] focus:border-maple-leaf/50 outline-none appearance-none"
                                    >
                                        {[...Array(16)].map((_, i) => (
                                            <option key={i} value={i}>Channel {i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LobeControls;
