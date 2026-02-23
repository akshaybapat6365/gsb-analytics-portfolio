"use client";

import { motion, type Transition, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type MotionProfile =
  | "forensic"
  | "operations"
  | "geo"
  | "systems"
  | "cinematic";

type RouteRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  profile: MotionProfile;
};

const PROFILE_MAP: Record<
  MotionProfile,
  { y: number; scale: number; transition: Transition }
> = {
  forensic: {
    y: 22,
    scale: 0.988,
    transition: { duration: 0.56, ease: [0.2, 0.45, 0.25, 1] },
  },
  operations: {
    y: 14,
    scale: 0.994,
    transition: { duration: 0.44, ease: [0.16, 0.5, 0.24, 1] },
  },
  geo: {
    y: 24,
    scale: 0.985,
    transition: { duration: 0.72, ease: [0.19, 0.47, 0.28, 1] },
  },
  systems: {
    y: 16,
    scale: 0.99,
    transition: { duration: 0.5, ease: [0.2, 0.44, 0.24, 1] },
  },
  cinematic: {
    y: 28,
    scale: 0.982,
    transition: { duration: 0.82, ease: [0.18, 0.42, 0.24, 1] },
  },
};

export function RouteReveal({
  children,
  className,
  delay = 0,
  profile,
}: RouteRevealProps) {
  const profileCfg = PROFILE_MAP[profile];
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? undefined : { opacity: 0, y: profileCfg.y, scale: profileCfg.scale }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={reduceMotion ? { duration: 0 } : { ...profileCfg.transition, delay }}
    >
      {children}
    </motion.div>
  );
}
