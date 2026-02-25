"use client";

import { useState, useCallback } from "react";

/**
 * Global State Store — stubbed to use React useState instead of zustand
 * When zustand is installed, replace this with the real implementation.
 */

interface PriceWarState {
    aggressiveness: number;
    competitorReactivity: number;
    selectedIndex: number;
    scrollProgress: number;
    activeChapter: number;
    xrayMode: boolean;
    setAggressiveness: (v: number) => void;
    setCompetitorReactivity: (v: number) => void;
    setSelectedIndex: (v: number) => void;
    setScrollProgress: (v: number) => void;
    setActiveChapter: (v: number) => void;
    toggleXrayMode: () => void;
}

// Simple hook-based store fallback
let _state: PriceWarState | null = null;
const _listeners = new Set<() => void>();

function getState(): PriceWarState {
    if (!_state) {
        _state = {
            aggressiveness: 64,
            competitorReactivity: 58,
            selectedIndex: 0,
            scrollProgress: 0,
            activeChapter: 0,
            xrayMode: false,
            setAggressiveness: (v: number) => { _state!.aggressiveness = v; _listeners.forEach(l => l()); },
            setCompetitorReactivity: (v: number) => { _state!.competitorReactivity = v; _listeners.forEach(l => l()); },
            setSelectedIndex: (v: number) => { _state!.selectedIndex = v; _listeners.forEach(l => l()); },
            setScrollProgress: (v: number) => { _state!.scrollProgress = v; _listeners.forEach(l => l()); },
            setActiveChapter: (v: number) => { _state!.activeChapter = v; _listeners.forEach(l => l()); },
            toggleXrayMode: () => { _state!.xrayMode = !_state!.xrayMode; _listeners.forEach(l => l()); },
        };
    }
    return _state;
}

export function usePriceWarStore<T = PriceWarState>(selector?: (state: PriceWarState) => T): T {
    const state = getState();
    if (selector) return selector(state);
    return state as unknown as T;
}
