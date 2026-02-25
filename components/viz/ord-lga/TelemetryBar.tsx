"use client";

import { usePriceWarStore } from "./global-state";
import { TelemetryEqualizer } from "./TelemetryEqualizer";

/**
 * Phase 6: Telemetry Bar (Step 83)
 * A fixed footer that tracks raw simulation stats, mouse coordinates, 
 * and WebGL active targets, mimicking a diagnostic terminal.
 */

export function TelemetryBar() {
    const { aggressiveness, competitorReactivity, activeNodeId, viewMode, xrayMode, toggleXrayMode } = usePriceWarStore();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [fps, setFps] = useState(60);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);

        // Mock FPS jitter for authentic terminal feel
        const interval = setInterval(() => {
            setFps(60 - Math.floor(Math.random() * 3));
        }, 1000);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearInterval(interval);
        };
    }, []);

    // Global X-Ray CSS class toggle
    useEffect(() => {
        if (xrayMode) document.body.classList.add("xray-mode");
        else document.body.classList.remove("xray-mode");
    }, [xrayMode]);

    return (
        <div className="fixed bottom-0 left-0 w-full h-8 bg-[#02050b]/90 border-t border-plasma-cyan/20 backdrop-blur-xl z-50 flex items-center justify-between px-4 neural-mono-data text-[10px] text-plasma-cyan uppercase tracking-widest hidden sm:flex">

            <div className="flex items-center space-x-6">
                <span>STATUS: <span className="text-plasma-magenta ml-1 animate-pulse">ONLINE</span></span>
                <span className="opacity-60">XY: [{mousePos.x}, {mousePos.y}]</span>
                <span className="opacity-60">FPS: {fps}</span>
            </div>

            <div className="flex items-center space-x-6">
                <span>VAR_AGG: {aggressiveness.toFixed(1)}</span>
                <span>VAR_REACT: {competitorReactivity.toFixed(1)}</span>
                <span>MODE: {viewMode}</span>
                {activeNodeId && <span className="text-plasma-magenta">LOCKED: {activeNodeId}</span>}
                <button
                    onClick={toggleXrayMode}
                    className={`ml-4 px-2 py-0.5 rounded-sm border transition-colors ${xrayMode ? 'bg-frost-white text-black border-frost-white' : 'border-plasma-cyan text-plasma-cyan hover:bg-plasma-cyan/20'}`}
                >
                    X-RAY: {xrayMode ? 'ON' : 'OFF'}
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="opacity-40">VB_LABS // v2_NEURAL_ENGINE</div>
                <TelemetryEqualizer bars={16} />
            </div>

        </div>
    );
}
