"use client";

import dynamic from "next/dynamic";

const SignalWallDynamic = dynamic(
  () => import("@/components/home/SignalWall").then((mod) => mod.SignalWall),
  { ssr: false },
);

export function DeferredSignalWall() {
  return <SignalWallDynamic />;
}
