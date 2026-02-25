"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Line, Preload } from "@react-three/drei";
import * as THREE from "three";
import { usePriceWarStore } from "./global-state";
import { ParticleSystem } from "./ParticleSystem";

/**
 * Phase 2: R3F Interactive Prologue
 * Contains the Earth Globe, ORD->LGA Flight Arc, and Data Point Cloud
 */

function HeroGlobe() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Slowly rotate the Earth
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <Sphere ref={meshRef} args={[2, 64, 64]} position={[0, -1.8, 0]}>
            {/* Deep Ocean base material */}
            <meshStandardMaterial
                color="#040B16"
                emissive="#00F0FF"
                emissiveIntensity={0.1}
                wireframe={true}
                transparent
                opacity={0.3}
            />
        </Sphere>
    );
}

function FlightArc3D() {
    // ORD approx coords on our sphere
    const start = new THREE.Vector3(-1, 0.5, 1.2);
    // LGA approx coords
    const end = new THREE.Vector3(1, 0.4, 1.4);

    // Bezier curve control point (above the arc)
    const mid = new THREE.Vector3(0, 1.5, 1.3);

    const curve = useMemo(() => {
        return new THREE.QuadraticBezierCurve3(start, mid, end);
    }, [start, mid, end]);

    const points = useMemo(() => curve.getPoints(50), [curve]);

    return (
        <group>
            {/* Glowing Arc Line */}
            <Line
                points={points}
                color="#FF007F"
                lineWidth={3}
                transparent
                opacity={0.8}
            />

            {/* ORD Node */}
            <mesh position={start}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="#00F0FF" />
            </mesh>

            {/* LGA Node */}
            <mesh position={end}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="#00F0FF" />
            </mesh>
        </group>
    );
}

function DataCloud() {
    const count = 1000;
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Setup standard randomized point cloud representing "decisions"
    useMemo(() => {
        if (!meshRef.current) return;
        for (let i = 0; i < count; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4 + 1,
                (Math.random() - 0.5) * 2
            );
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            dummy.scale.setScalar(Math.random() * 0.05 + 0.01);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [dummy]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#00F0FF" transparent opacity={0.4} wireframe />
        </instancedMesh>
    );
}

function VolumeCube() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <mesh ref={meshRef} position={[-2, 1, -2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#8B00FF" wireframe />
        </mesh>
    );
}

function CameraDirector() {
    const { camera } = useThree();
    const scrollProgress = usePriceWarStore(state => state.scrollProgress);

    useFrame(() => {
        // Parallax camera movement mapped to global scroll
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5 - scrollProgress * 2, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, scrollProgress * 1, 0.05);
        camera.lookAt(0, 0, 0);
    });

    return null;
}

export function PrologueCanvas3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00F0FF" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#FF007F" />

                <HeroGlobe />
                <FlightArc3D />
                <DataCloud />
                <VolumeCube />
                <ParticleSystem count={2500} />
                <CameraDirector />

                <Preload all />
            </Canvas>
        </div>
    );
}
