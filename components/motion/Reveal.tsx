"use client";

import { motion, type Transition, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

const transition: Transition = {
  duration: 0.7,
  ease: [0.21, 0.47, 0.32, 0.98],
};

export function Reveal({ children, className, delay = 0, y = 18 }: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}
