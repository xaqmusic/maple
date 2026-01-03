import React from 'react';

const LobeControls = ({ lobe, onUpdate }) => {
    if (!lobe) return null;

    const handleChange = (field, value) => {
        onUpdate({ ...lobe, [field]: value });
    };

    return (
        <div className="bg-maple-dark/80 backdrop-blur-md border border-maple-leaf/30 p-3 rounded-lg w-48 text-xs text-maple-leaf shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <h3 className="font-bold border-b border-maple-leaf/20 mb-2 pb-1 uppercase tracking-wider">{lobe.name}</h3>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label>Active</label>
                    <input
                        type="checkbox"
                        checked={lobe.active}
                        onChange={(e) => handleChange('active', e.target.checked)}
                        className="accent-maple-vein"
                    />
                </div>

                <div>
                    <div>
                        <label className="block text-gray-400 mb-1">Rhythm</label>
                        <select
                            value={lobe.division}
                            onChange={(e) => handleChange('division', parseFloat(e.target.value))}
                            className="w-full bg-black/40 border border-maple-leaf/20 rounded-md p-1 mb-2"
                        >
                            <option value="0.25">Whole Note</option>
                            <option value="0.5">Half Note</option>
                            <option value="1">Quarter Note</option>
                            <option value="2">8th Note</option>
                            <option value="4">16th Note</option>
                        </select>

                        <label className="block text-gray-400 mb-1">Probability</label>
                        <input
                            type="range"
                            min="0" max="1" step="0.1"
                            value={lobe.probability}
                            onChange={(e) => handleChange('probability', parseFloat(e.target.value))}
                            className="w-full accent-maple-leaf h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer mb-2"
                        />

                        <div className="flex justify-between items-center text-gray-400 mb-1">
                            <label>Transpose</label>
                            <span className={lobe.transpose > 0 ? 'text-maple-vein' : lobe.transpose < 0 ? 'text-blue-400' : ''}>
                                {lobe.transpose > 0 ? `+${lobe.transpose}` : lobe.transpose}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-36" max="36" step="1"
                            value={lobe.transpose}
                            onChange={(e) => handleChange('transpose', parseInt(e.target.value))}
                            className="w-full accent-maple-leaf h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 mb-1">Channel: {lobe.instrument_channel + 1}</label>
                    {/* Simple channel selector would go here */}
                </div>
            </div>
        </div>
    );
};

export default LobeControls;
