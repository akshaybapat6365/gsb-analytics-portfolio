// Stub type declarations for 'three' package.
// The actual three.js library is not used (replaced with Canvas2D fallbacks),
// but its types entry remains in node_modules from a prior install.
declare module "three" {
    export const REVISION: string;
    export class Vector3 {
        constructor(x?: number, y?: number, z?: number);
        x: number;
        y: number;
        z: number;
    }
    export class Color {
        constructor(color?: string | number);
    }
    export class Scene { }
    export class PerspectiveCamera { }
    export class WebGLRenderer { }
    export class Mesh { }
    export class BufferGeometry { }
    export class Material { }
    export class Object3D { }
}

declare module "@react-three/fiber" {
    export const Canvas: React.FC<Record<string, unknown>>;
    export function useFrame(callback: (state: unknown, delta: number) => void): void;
    export function useThree(): Record<string, unknown>;
}

declare module "@react-three/drei" {
    export const OrbitControls: React.FC<Record<string, unknown>>;
    export const Text: React.FC<Record<string, unknown>>;
    export const Html: React.FC<Record<string, unknown>>;
}

declare module "@react-three/postprocessing" {
    export const EffectComposer: React.FC<Record<string, unknown>>;
    export const Bloom: React.FC<Record<string, unknown>>;
}
