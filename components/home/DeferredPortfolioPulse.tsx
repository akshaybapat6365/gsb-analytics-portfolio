"use client";

import dynamic from "next/dynamic";

const PortfolioPulseDynamic = dynamic(
  () => import("@/components/home/PortfolioPulse").then((mod) => mod.PortfolioPulse),
  { ssr: false },
);

export function DeferredPortfolioPulse() {
  return <PortfolioPulseDynamic />;
}
