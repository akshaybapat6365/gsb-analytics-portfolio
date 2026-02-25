"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HEATMAP_FRAGMENT_SHADER, HEATMAP_VERTEX_SHADER } from "./useDataShaders";
import { usePriceWarStore } from "./global-state";
import { ShaderTooltip } from "./ShaderTooltip";

/**
 * Phase 3: GLSL Heatmap
 * Replaces the old SVG RegretHeatLattice with a pure GPU fragment shader 
 * rendering an interpolated 50x50 data matrix at 60fps.
 */

function HeatmapPlane({ dataTexture }: { dataTexture: THREE.DataTexture | null }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const aggressiveness = usePriceWarStore(s => s.aggressiveness);

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                dataTexture: { value: dataTexture },
                minVal: { value: 0 },
                maxVal: { value: 1000 },
                time: { value: 0 },
                aggressiveness: { value: aggressiveness / 100 }
            },
            vertexShader: HEATMAP_VERTEX_SHADER,
            fragmentShader: HEATMAP_FRAGMENT_SHADER,
            transparent: true,
            blending: THREE.AdditiveBlending,
            wireframe: usePriceWarStore.getState().wireframeMode,
        });
    }, [dataTexture]);

    useFrame((state) => {
        if (material.uniforms.time) {
            material.uniforms.time.value = state.clock.elapsedTime;
            // Interpolate aggressiveness on GPU for zero-latency slider sync
            material.uniforms.aggressiveness.value = THREE.MathUtils.lerp(
                material.uniforms.aggressiveness.value,
                usePriceWarStore.getState().aggressiveness / 100,
                0.1
            );

            // Re-sync wireframe mode if changed
            const currentWireframe = usePriceWarStore.getState().wireframeMode;
            if (material.wireframe !== currentWireframe) {
                material.wireframe = currentWireframe;
                material.needsUpdate = true;
            }
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2, 64, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

export function GLSLHeatmap() {
    // Mocking the generated 50x50 texture until the Webworker connects
    const mockTexture = useMemo(() => {
        const size = 50 * 50;
        const data = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            data[i] = Math.random() * 1000;
        }
        const tex = new THREE.DataTexture(data, 50, 50, THREE.RedFormat, THREE.FloatType);
        tex.needsUpdate = true;
        return tex;
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[400px] relative rounded-lg overflow-hidden border border-plasma-cyan/20">
            <Canvas camera={{ position: [0, 0, 1.5], fov: 60 }}>
                {/* Fallback to high-res static canvas handled natively by WebGL missing exception */}
                <HeatmapPlane dataTexture={mockTexture} />
            </Canvas>

            <ShaderTooltip containerRef={containerRef} />

            {/* HUD Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <span className="neural-eyebrow text-plasma-cyan">GLSL_SURFACE_50x50</span>
                <div className="flex justify-between w-full">
                    <span className="neural-mono-data text-xs text-frost-white/50">Min: 0</span>
                    <span className="neural-mono-data text-xs text-plasma-magenta">Max: 1000</span>
                </div>
            </div>
        </div>
    );
}
