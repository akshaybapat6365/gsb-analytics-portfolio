"use client";

import { motion, type Transition } from "framer-motion";
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
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}

