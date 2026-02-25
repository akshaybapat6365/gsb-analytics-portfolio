"use client";

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

/**
 * Global state for the Price War project.
 * React Context + useReducer pattern replaces the zustand singleton.
 */

// ── Types ──

export interface PriceWarGlobalState {
    selectedDayIndex: number;
    mode: "observed" | "counterfactual" | "delta";
    aggressiveness: number;
    competitorReactivity: number;
    shockReplay: boolean;
    hoveredPoint: { x: number; y: number; value: number } | null;
    xrayMode: boolean;
    fps: number;
}

type Action =
    | { type: "SET_SELECTED_DAY"; index: number }
    | { type: "SET_MODE"; mode: PriceWarGlobalState["mode"] }
    | { type: "SET_AGGRESSIVENESS"; value: number }
    | { type: "SET_COMPETITOR_REACTIVITY"; value: number }
    | { type: "SET_SHOCK_REPLAY"; enabled: boolean }
    | { type: "SET_HOVERED_POINT"; point: PriceWarGlobalState["hoveredPoint"] }
    | { type: "TOGGLE_XRAY" }
    | { type: "SET_FPS"; fps: number };

// ── Initial state ──

const initialState: PriceWarGlobalState = {
    selectedDayIndex: 0,
    mode: "observed",
    aggressiveness: 64,
    competitorReactivity: 58,
    shockReplay: false,
    hoveredPoint: null,
    xrayMode: false,
    fps: 60,
};

// ── Reducer ──

function priceWarReducer(state: PriceWarGlobalState, action: Action): PriceWarGlobalState {
    switch (action.type) {
        case "SET_SELECTED_DAY":
            return { ...state, selectedDayIndex: action.index };
        case "SET_MODE":
            return { ...state, mode: action.mode };
        case "SET_AGGRESSIVENESS":
            return { ...state, aggressiveness: action.value };
        case "SET_COMPETITOR_REACTIVITY":
            return { ...state, competitorReactivity: action.value };
        case "SET_SHOCK_REPLAY":
            return { ...state, shockReplay: action.enabled };
        case "SET_HOVERED_POINT":
            return { ...state, hoveredPoint: action.point };
        case "TOGGLE_XRAY":
            return { ...state, xrayMode: !state.xrayMode };
        case "SET_FPS":
            return { ...state, fps: action.fps };
        default:
            return state;
    }
}

// ── Context ──

const PriceWarContext = createContext<{
    state: PriceWarGlobalState;
    dispatch: React.Dispatch<Action>;
}>({
    state: initialState,
    dispatch: () => undefined,
});

// ── Provider ──

export function PriceWarProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(priceWarReducer, initialState);
    return (
        <PriceWarContext.Provider value= {{ state, dispatch }
}>
    { children }
    </PriceWarContext.Provider>
  );
}

// ── Hook ──

export function usePriceWarStore() {
    const { state, dispatch } = useContext(PriceWarContext);

    const setSelectedDay = useCallback(
        (index: number) => dispatch({ type: "SET_SELECTED_DAY", index }),
        [dispatch],
    );

    const setMode = useCallback(
        (mode: PriceWarGlobalState["mode"]) => dispatch({ type: "SET_MODE", mode }),
        [dispatch],
    );

    const setAggressiveness = useCallback(
        (value: number) => dispatch({ type: "SET_AGGRESSIVENESS", value }),
        [dispatch],
    );

    const setCompetitorReactivity = useCallback(
        (value: number) => dispatch({ type: "SET_COMPETITOR_REACTIVITY", value }),
        [dispatch],
    );

    const setShockReplay = useCallback(
        (enabled: boolean) => dispatch({ type: "SET_SHOCK_REPLAY", enabled }),
        [dispatch],
    );

    const setHoveredPoint = useCallback(
        (point: PriceWarGlobalState["hoveredPoint"]) =>
            dispatch({ type: "SET_HOVERED_POINT", point }),
        [dispatch],
    );

    const toggleXray = useCallback(
        () => dispatch({ type: "TOGGLE_XRAY" }),
        [dispatch],
    );

    const setFps = useCallback(
        (fps: number) => dispatch({ type: "SET_FPS", fps }),
        [dispatch],
    );

    return {
        ...state,
        setSelectedDay,
        setMode,
        setAggressiveness,
        setCompetitorReactivity,
        setShockReplay,
        setHoveredPoint,
        toggleXray,
        setFps,
    };
}
