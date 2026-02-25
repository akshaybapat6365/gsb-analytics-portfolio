"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Phase 1: WebGL Canvas Pipeline Setup
 * This is the raw WebGL/Three.js manager that sets up the full-bleed canvas
 * and handles resizing before React Three Fiber mounts.
 */
export function WebGLBackground() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x040B16, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Append to DOM
        mountRef.current.appendChild(renderer.domElement);

        // Subtle background procedural dust particles
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 2000; i++) {
            vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
            vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
            vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // Cyan tinted tiny stardust
        const material = new THREE.PointsMaterial({ color: 0x00F0FF, size: 2, transparent: true, opacity: 0.15 });
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        const animate = () => {
            requestAnimationFrame(animate);
            particles.rotation.y += 0.0002;
            particles.rotation.x += 0.0001;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            mountRef.current?.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />;
}
