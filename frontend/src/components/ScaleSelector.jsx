import React from 'react';

const ScaleSelector = ({ selectedNotes = [], onUpdate }) => {
    // Generate two octaves of notes starting from C3 (MIDI 60)
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notes = Array.from({ length: 25 }, (_, i) => ({
        name: noteNames[i % 12] + (i === 24 ? ' (High)' : ''),
        midi: 60 + i
    }));

    const safeSelectedNotes = Array.isArray(selectedNotes) ? selectedNotes : [];

    const toggleNote = (midi) => {
        let newSelection;
        if (safeSelectedNotes.includes(midi)) {
            newSelection = safeSelectedNotes.filter(n => n !== midi);
        } else {
            newSelection = [...safeSelectedNotes, midi];
        }
        if (onUpdate) onUpdate(newSelection);
    };

    return (
        <div className="flex gap-1.5 p-3 bg-black/40 rounded-3xl backdrop-blur-2xl border border-white/5 shadow-2xl mb-12 max-w-[95vw] overflow-x-auto scrollbar-hide">
            {notes.map((note) => {
                const isActive = safeSelectedNotes.includes(note.midi);
                const isSharp = note.name.includes('#');

                return (
                    <button
                        key={note.midi}
                        onClick={() => toggleNote(note.midi)}
                        className={`
                            relative flex flex-col items-center justify-end pb-2 group transition-all duration-300
                            ${isSharp ? 'w-8 h-12 -mx-1 z-10 rounded-xl' : 'w-10 h-16 rounded-2xl'}
                            ${isActive
                                ? 'bg-maple-leaf text-black font-bold scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)] ring-2 ring-maple-leaf/50'
                                : isSharp
                                    ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 hover:bg-zinc-800'
                                    : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:border-white/20'}
                        `}
                    >
                        <span className="text-[9px] uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                            {note.name.replace(' (High)', '')}
                        </span>
                        {/* Indicator dot */}
                        <div className={`
                            w-1 h-1 rounded-full mt-1 transition-all duration-300
                            ${isActive ? 'bg-black scale-125' : 'bg-transparent'}
                        `} />
                    </button>
                );
            })}
        </div>
    );
};

export default ScaleSelector;
