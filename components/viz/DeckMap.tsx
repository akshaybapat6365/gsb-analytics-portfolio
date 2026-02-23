"use client";

import dynamic from "next/dynamic";
import type { Layer, PickingInfo } from "@deck.gl/core";
import { cn } from "@/lib/cn";

export type DeckMapProps = {
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  layers: Layer[];
  className?: string;
  height?: number;
  mapStyle?: string;
  getTooltip?: (info: PickingInfo) => string | null;
  dataTestId?: string;
};

const DeckMapCanvas = dynamic(
  () => import("@/components/viz/DeckMapCanvas").then((mod) => mod.DeckMapCanvas),
  {
    ssr: false,
    loading: () => (
      <section className={cn("glass overflow-hidden rounded-2xl")}>
        <div className="h-[420px] w-full animate-pulse bg-white/[0.04]" />
      </section>
    ),
  },
);

export function DeckMap(props: DeckMapProps) {
  return <DeckMapCanvas {...props} />;
}
