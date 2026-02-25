"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePriceWarStore } from "./global-state";

/**
 * Phase 3: Monte Carlo Scatter Cloud
 * Employs gl.POINTS to render an astonishing 50,000 data points 
 * without clogging the DOM, replacing the SVG Ridge plot.
 */

const POINT_COUNT = 50000;

function ScatterPoints() {
    const pointsRef = useRef<THREE.Points>(null);
    const aggressiveness = usePriceWarStore(s => s.aggressiveness);

    // Procedural 50k point generation
    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(POINT_COUNT * 3);
        const col = new Float32Array(POINT_COUNT * 3);

        // Base colors
        const c1 = new THREE.Color("#00F0FF"); // Cyan Model 
        const c2 = new THREE.Color("#FF007F"); // Magenta Market
        const mixed = new THREE.Color();

        for (let i = 0; i < POINT_COUNT; i++) {
            // Gaussian distribution approx
            const u = 1 - Math.random();
            const v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

            const x = (Math.random() - 0.5) * 4; // Spread across x
            const y = z * 0.5; // Bell curve height

            pos[i * 3 + 0] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // Depth variance

            // Mix colors based on position
            mixed.lerpColors(c2, c1, Math.max(0, Math.min(1, (x + 2) / 4)));
            col[i * 3 + 0] = mixed.r;
            col[i * 3 + 1] = mixed.g;
            col[i * 3 + 2] = mixed.b;
        }
        return { positions: pos, colors: col };
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            // Shift the massive point cloud slightly based on tuning state
            const targetRotation = (aggressiveness / 100 - 0.5) * Math.PI * 0.5;
            pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, targetRotation, 0.05);
            // Gentle breathing
            pointsRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={POINT_COUNT}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={POINT_COUNT}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.015}
                vertexColors={true}
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

export function CanvasPointScatter() {
    return (
        <div className="w-full h-full min-h-[400px] relative rounded-lg bg-neural-surface/50 border border-plasma-cyan/10">
            <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
                <ScatterPoints />
            </Canvas>
            <div className="absolute top-4 left-4 pointer-events-none">
                <span className="neural-eyebrow text-frost-white">MONTE_CARLO_SIMULATION</span>
                <p className="neural-mono-data text-plasma-cyan mt-1 text-sm">N=50,000 (GPU INSTANCED)</p>
            </div>
        </div>
    );
}
