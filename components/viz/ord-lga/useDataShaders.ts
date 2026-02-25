import { useMemo } from "react";
import * as THREE from "three";

/**
 * Phase 1 / Phase 3 Bridge: Data Shaders
 * This hook generates and compiles GLSL ShaderMaterials for mapping matrix data
 * directly to GPU surfaces, bypassing the DOM entirely for 0ms latency contouring.
 */

export const HEATMAP_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
    vUv = uv;
    // Displace vertex slightly based on data matrix later if needed
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
`;

export const HEATMAP_FRAGMENT_SHADER = `
uniform sampler2D dataTexture;
uniform float minVal;
uniform float maxVal;
varying vec2 vUv;

// Plasma Magneic Palette
vec3 plasma(float t) {
    vec3 c0 = vec3(0.015, 0.043, 0.086); // Deep Void
    vec3 c1 = vec3(0.000, 0.941, 1.000); // Cyan
    vec3 c2 = vec3(1.000, 0.000, 0.498); // Magenta
    
    if (t < 0.5) {
        return mix(c0, c1, t * 2.0);
    } else {
        return mix(c1, c2, (t - 0.5) * 2.0);
    }
}

void main() {
    // Read raw 32-bit float matrix data from texture
    vec4 dataStr = texture2D(dataTexture, vUv);
    float value = dataStr.r;
    
    // Normalize against domain
    float normalized = clamp((value - minVal) / (maxVal - minVal), 0.0, 1.0);
    
    vec3 color = plasma(normalized);
    gl_FragColor = vec4(color, 0.85); // 0.85 opacity for glassmorphism layering
}
`;

export function useDataShaders() {
    const heatmapMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                dataTexture: { value: null }, // Will be bound to a DataTexture containing Regret matrix
                minVal: { value: 0 },
                maxVal: { value: 100 },
            },
            vertexShader: HEATMAP_VERTEX_SHADER,
            fragmentShader: HEATMAP_FRAGMENT_SHADER,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });
    }, []);

    return { heatmapMaterial };
}
