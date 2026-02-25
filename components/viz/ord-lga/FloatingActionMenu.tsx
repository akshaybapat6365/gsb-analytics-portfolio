"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePriceWarStore } from "./global-state";

/**
 * Phase 6 (Step 82): FloatingActionMenu
 * Page-level controls, export, and configuration actions.
 */

export function FloatingActionMenu() {
    const [open, setOpen] = useState(false);
    const { toggleDebugMode, debugMode } = usePriceWarStore();

    const handleExport = () => {
        // Mock export trigger
        alert("System diagnostic exported to PDF.");
    };

    return (
        <div className="fixed bottom-12 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="flex flex-col gap-2 mb-2"
                    >
                        <button onClick={handleExport} className="w-10 h-10 rounded-full neural-glass-panel border-plasma-cyan/50 text-plasma-cyan flex items-center justify-center hover:bg-plasma-cyan/20 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                        </button>
                        <button onClick={toggleDebugMode} className="w-10 h-10 rounded-full neural-glass-panel border-plasma-magenta/50 text-plasma-magenta flex items-center justify-center hover:bg-plasma-magenta/20 transition-colors shadow-[0_0_15px_rgba(255,0,127,0.3)]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setOpen(!open)}
                className="w-12 h-12 rounded-full bg-black border border-frost-white/20 text-frost-white flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <motion.div animate={{ rotate: open ? 45 : 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                </motion.div>
            </button>
        </div>
    );
}
