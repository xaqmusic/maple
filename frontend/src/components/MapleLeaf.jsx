import React, { useEffect, useState } from 'react';
import mapleLeafBg from '../assets/maple_leaf.svg';

const MapleLeaf = ({ pulses = [], onPulsesProcessed, stemPulseCount, onLobeClick, selectedLobeId, isUIHidden }) => {
    const [activePulses, setActivePulses] = useState([]);
    const [stemFlash, setStemFlash] = useState(false);
    const [clickRipples, setClickRipples] = useState([]);

    useEffect(() => {
        if (pulses.length > 0) {
            const now = Date.now();
            const newPulses = pulses.map(p => ({
                ...p,
                id: p.id || (now + Math.random()),
                createdAt: now
            }));

            setActivePulses(prev => [...prev, ...newPulses]);

            // Clean up each pulse after animation
            newPulses.forEach(p => {
                setTimeout(() => {
                    setActivePulses(prev => prev.filter(ap => ap.id !== p.id));
                }, 1000);
            });

            onPulsesProcessed();
        }
    }, [pulses, onPulsesProcessed]);

    useEffect(() => {
        if (stemPulseCount > 0) {
            setStemFlash(true);
            const timer = setTimeout(() => setStemFlash(false), 200)
            return () => clearTimeout(timer);
        }
    }, [stemPulseCount]);

    // Simplified SVG paths for a 5-lobed leaf
    // In a real scenario, these would be more complex bezier curves
    const veins = [
        { id: 0, d: "M 217,430 Q 250,370 233,330 Q 140,310 110,330", end: { x: 110, y: 330 }, name: "Left Bottom" },
        { id: 1, d: "M 217,430 Q 250,370 233,330 Q 160,260 110,210", end: { x: 110, y: 210 }, name: "Left Top" },
        { id: 2, d: "M 217,430 Q 250,370 233,330 Q 230,210 215,110", end: { x: 215, y: 110 }, name: "Center" },
        { id: 3, d: "M 217,430 Q 250,370 233,330 Q 240,260 358,200", end: { x: 358, y: 200 }, name: "Right Top" },
        { id: 4, d: "M 217,430 Q 250,370 233,330 Q 260,310 357,310", end: { x: 357, y: 310 }, name: "Right Bottom" }
    ];

    return (
        <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            {/* Background Image (Base) */}
            <image
                href={mapleLeafBg}
                x="0"
                y="50"
                width="400"
                height="450"
                preserveAspectRatio="xMidYMid meet"
                opacity="0.3"
                transform="rotate(-40, 200, 225)"
                className="transition-opacity duration-1000"
            />

            {/* Root Glow */}
            <circle cx="217" cy="430" r="30" fill="url(#rootGlow)" className="opacity-40" />
            <defs>
                <radialGradient id="rootGlow">
                    <stop offset="0%" stopColor="#ff4d00" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>

            {/* Stem with Flash effect */}
            <path
                d="M 217,430 Q 250,370 233,330"
                fill="none"
                stroke={stemFlash ? "#ff4d00" : "#8b4513"}
                strokeWidth={stemFlash ? "3" : "2"}
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
            />

            {/* Veins */}
            {veins.map((vein) => (
                <g key={vein.id}>
                    {/* Base Vein */}
                    <path
                        d={vein.d}
                        fill="none"
                        stroke={activePulses.some(p => p.lobe_id === vein.id) ? "#ff4d00" : "#4a3b2a"}
                        strokeWidth={activePulses.some(p => p.lobe_id === vein.id) ? "3" : "2"}
                        className="transition-all duration-300 ease-out"
                        style={{
                            opacity: activePulses.some(p => p.lobe_id === vein.id) ? 1 : 0.4,
                            filter: activePulses.some(p => p.lobe_id === vein.id) ? "drop-shadow(0 0 8px #ff4d00)" : "none"
                        }}
                    />

                    {/* Active Pulse Animation along the vein */}
                    {activePulses.filter(p => p.lobe_id === vein.id).map((p) => (
                        <g key={p.id}>
                            <circle r="6" fill="#ffcc00" className="drop-shadow-[0_0_12px_#ff4d00]">
                                <animateMotion
                                    dur="0.8s"
                                    repeatCount="1"
                                    path={vein.d}
                                    fill="freeze"
                                    calcMode="spline"
                                    keyTimes="0;1"
                                    keySplines="0.4 0 0.2 1"
                                />
                                <animate
                                    attributeName="opacity"
                                    values="1;1;0"
                                    keyTimes="0;0.7;1"
                                    dur="0.8s"
                                    fill="freeze"
                                />
                            </circle>
                        </g>
                    ))}

                    {/* Lobe Tip / Activator */}
                    <circle
                        cx={vein.end.x}
                        cy={vein.end.y}
                        r={selectedLobeId === vein.id ? "14" : activePulses.some(p => p.lobe_id === vein.id) ? "10" : "8"}
                        fill={selectedLobeId === vein.id ? "#ff4d00" : activePulses.some(p => p.lobe_id === vein.id) ? "#d4af37" : (isUIHidden ? "#2d0a0a" : "#1a0f0f")}
                        stroke={isUIHidden && !activePulses.some(p => p.lobe_id === vein.id) ? "#4a0a0a" : "#d4af3770"}
                        strokeWidth={selectedLobeId === vein.id ? "3" : "2"}
                        className="transition-all duration-300 cursor-pointer hover:stroke-white"
                        onClick={() => {
                            const rippleId = Date.now() + Math.random();
                            const pulseId = Date.now() + Math.random();

                            setClickRipples(prev => [...prev, { id: rippleId, x: vein.end.x, y: vein.end.y }]);
                            setActivePulses(prev => [...prev, { id: pulseId, lobe_id: vein.id, createdAt: Date.now() }]);

                            setTimeout(() => {
                                setClickRipples(prev => prev.filter(r => r.id !== rippleId));
                            }, 1000);
                            setTimeout(() => {
                                setActivePulses(prev => prev.filter(p => p.id !== pulseId));
                            }, 1000);

                            onLobeClick(vein.id);
                        }}
                    >
                        {selectedLobeId === vein.id && (
                            <animate
                                attributeName="r"
                                values="12;14;12"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        )}
                    </circle>

                    {/* Click Ripples */}
                    {clickRipples.filter(r => r.x === vein.end.x && r.y === vein.end.y).map(ripple => (
                        <circle
                            key={ripple.id}
                            cx={ripple.x}
                            cy={ripple.y}
                            r="8"
                            fill="none"
                            stroke="#d4af37"
                            strokeWidth="2"
                            className="pointer-events-none"
                        >
                            <animate
                                attributeName="r"
                                from="8"
                                to="40"
                                dur="0.6s"
                                begin="0s"
                                fill="freeze"
                            />
                            <animate
                                attributeName="opacity"
                                from="0.8"
                                to="0"
                                dur="0.6s"
                                begin="0s"
                                fill="freeze"
                            />
                            <animate
                                attributeName="stroke-width"
                                from="2"
                                to="0.5"
                                dur="0.6s"
                                begin="0s"
                                fill="freeze"
                            />
                        </circle>
                    ))}
                </g>
            ))}


            {/* Foreground Overlay Image (Active during Idle) */}
            <image
                href={mapleLeafBg}
                x="0"
                y="50"
                width="400"
                height="450"
                preserveAspectRatio="xMidYMid meet"
                transform="rotate(-40, 200, 225)"
                className={`pointer-events-none transition-opacity duration-1000 ${isUIHidden ? 'opacity-40' : 'opacity-0'}`}
            />
        </svg>
    );
};

export default MapleLeaf;
