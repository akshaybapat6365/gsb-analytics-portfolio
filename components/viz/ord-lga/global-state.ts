import { create } from 'zustand';

// Phase 1: Global State Store for Cross-Linked Brushing and 3D Interaction
// This enables 0ms latency synchronization between HTML, SVGs, and WebGL elements.

export interface PriceWarGlobalState {
    // Navigation & Scrollytelling State
    activeIndex: number;
    setActiveIndex: (index: number) => void;
    scrollProgress: number; // 0 to 1
    setScrollProgress: (progress: number) => void;

    // Global Time Brushing (X-Axis filtering applied across all charts)
    brushRange: [number, number] | null; // e.g. [day 20, day 45]
    setBrushRange: (range: [number, number] | null) => void;

    // Policy Parameters (Mapped directly to WebGL uniform shaders for instant updates)
    aggressiveness: number;
    setAggressiveness: (val: number) => void;
    competitorReactivity: number;
    setCompetitorReactivity: (val: number) => void;

    // View Modes
    viewMode: 'observed' | 'counterfactual' | 'delta';
    setViewMode: (mode: 'observed' | 'counterfactual' | 'delta') => void;

    // 3D Specific
    activeNodeId: string | null;
    setActiveNodeId: (id: string | null) => void;
    cameraTarget: [number, number, number];
    setCameraTarget: (target: [number, number, number]) => void;

    // Easter Egg
    debugMode: boolean;
    toggleDebugMode: () => void;
    wireframeMode: boolean;
    toggleWireframeMode: () => void;
}

export const usePriceWarStore = create<PriceWarGlobalState>((set) => ({
    activeIndex: 0,
    setActiveIndex: (index) => set({ activeIndex: index }),

    scrollProgress: 0,
    setScrollProgress: (progress) => set({ scrollProgress: progress }),

    brushRange: null,
    setBrushRange: (range) => set({ brushRange: range }),

    aggressiveness: 80,
    setAggressiveness: (val) => set({ aggressiveness: val }),

    competitorReactivity: 50,
    setCompetitorReactivity: (val) => set({ competitorReactivity: val }),

    viewMode: 'observed',
    setViewMode: (mode) => set({ viewMode: mode }),

    activeNodeId: null,
    setActiveNodeId: (id) => set({ activeNodeId: id }),

    cameraTarget: [0, 0, 0],
    setCameraTarget: (target) => set({ cameraTarget: target }),

    debugMode: false,
    toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
    wireframeMode: false,
    toggleWireframeMode: () => set((state) => ({ wireframeMode: !state.wireframeMode })),
}));
