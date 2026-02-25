"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Phase 6 (Step 76): ParticleSystem
 * Background high-performance particle system (dust motes) using WebGL instancing.
 */

export function ParticleSystem({ count = 2000 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate random positions, speeds, and phases
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 10 - 5; // pushed back
            const speed = Math.random() * 0.02 + 0.01;
            const phase = Math.random() * Math.PI * 2;
            temp.push({ x, y, z, speed, phase });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;
        particles.forEach((p, i) => {
            // Gentle drift
            p.y += p.speed * 0.1;
            if (p.y > 20) p.y = -20;
            p.x += Math.sin(state.clock.elapsedTime * p.speed + p.phase) * 0.01;

            dummy.position.set(p.x, p.y, p.z);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <planeGeometry args={[0.04, 0.04]} />
            <meshBasicMaterial
                color="#00F0FF"
                transparent
                opacity={0.15}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </instancedMesh>
    );
}
