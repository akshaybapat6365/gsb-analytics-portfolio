"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { usePriceWarStore } from "./global-state";
import { shaderMaterial } from "@react-three/drei";

/**
 * Phase 3: GLSL Sensitivity Contour
 * Replaces the old SVG SensitivityContour with an organic, liquid-like
 * Perlin Noise gradient mapped to the aggressiveness and reactivity bounds.
 */

const SensitivityMaterial = shaderMaterial(
    {
        time: 0,
        aggressiveness: 0.5,
        reactivity: 0.5,
        resolution: new THREE.Vector2()
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader (Perlin-like math)
    `
    uniform float time;
    uniform float aggressiveness;
    uniform float reactivity;
    varying vec2 vUv;

    // Fast 2D hash
    vec2 hash2(vec2 p) {
      p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
      return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    }

    // 2D Noise
    float noise(in vec2 p) {
        const float K1 = 0.366025404; // (sqrt(3)-1)/2;
        const float K2 = 0.211324865; // (3-sqrt(3))/6;
        vec2 i = floor(p + (p.x+p.y)*K1);
        vec2 a = p - i + (i.x+i.y)*K2;
        vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0*K2;
        vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
        vec3 n = h*h*h*h*vec3( dot(a,hash2(i+0.0)), dot(b,hash2(i+o)), dot(c,hash2(i+1.0)));
        return dot(n, vec3(70.0));
    }

    void main() {
      // Warp coordinates based on store bounds
      vec2 p = vUv * 5.0;
      p.x += aggressiveness * 2.0;
      p.y += reactivity * 2.0;

      float f = noise(p + time * 0.2);
      
      // Map to Plasma Cyan/Purple
      vec3 col1 = vec3(0.0, 0.94, 1.0); // Plasma Cyan
      vec3 col2 = vec3(0.54, 0.0, 1.0); // Plasma Purple
      vec3 bg = vec3(0.015, 0.043, 0.086); // Neural Surface
      
      vec3 renderCol = mix(bg, col1, clamp(f, 0.0, 1.0));
      renderCol = mix(renderCol, col2, clamp(f * f, 0.0, 1.0));

      gl_FragColor = vec4(renderCol, 0.9);
    }
  `
);

// Register Declaratively
extend({ SensitivityMaterial });

type SensMaterialImpl = {
    time: number;
    aggressiveness: number;
    reactivity: number;
} & typeof THREE.ShaderMaterial;

function SensitivityPlane() {
    const matRef = useRef<SensMaterialImpl>(null);
    const { aggressiveness, competitorReactivity } = usePriceWarStore();

    useFrame((state) => {
        if (matRef.current) {
            matRef.current.time = state.clock.elapsedTime;
            // Smooth lerp on the GPU uniform bindings
            matRef.current.aggressiveness = THREE.MathUtils.lerp(matRef.current.aggressiveness, aggressiveness / 100, 0.05);
            matRef.current.reactivity = THREE.MathUtils.lerp(matRef.current.reactivity, competitorReactivity / 100, 0.05);
        }
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2, 32, 32]} />
            {/* @ts-ignore */}
            <sensitivityMaterial ref={matRef} transparent />
        </mesh>
    );
}

export function GLSLSensitivity() {
    return (
        <div className="w-full h-full min-h-[350px] relative rounded-lg overflow-hidden border border-plasma-purple/20">
            <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 200 }}>
                <SensitivityPlane />
            </Canvas>

            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <span className="neural-eyebrow text-plasma-purple">NOISE_CONTOUR_MATRIX</span>
                <div className="neural-glass-panel p-2 w-fit">
                    <span className="neural-mono-data text-[10px] text-frost-white/80">Bounds strictly governed by Reacitivty/Aggressiveness</span>
                </div>
            </div>
        </div>
    );
}
