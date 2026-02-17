import { existsSync } from "node:fs";
import path from "node:path";

import Image from "next/image";

import { cn } from "@/lib/cn";

type StoryVisualProps = {
  slug: string;
  title: string;
  caption?: string;
  className?: string;
  asset?: string;
  width?: number;
  height?: number;
};

function resolveAsset(slug: string, asset: string) {
  const publicDir = path.join(process.cwd(), "public", "assets", slug);
  const candidates = [`${asset}.webp`, `${asset}.png`, `${asset}.jpg`, `${asset}.svg`];

  for (const name of candidates) {
    const disk = path.join(publicDir, name);
    if (existsSync(disk)) return `/assets/${slug}/${name}`;
  }

  return "/assets/generic/hero.svg";
}

export function StoryVisual({
  slug,
  title,
  caption,
  className,
  asset = "hero",
  width = 1600,
  height = 900,
}: StoryVisualProps) {
  const src = resolveAsset(slug, asset);

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-3xl border border-white/10 bg-slate-950/35 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <Image
        src={src}
        alt={`${title} narrative visualization`}
        className="h-auto w-full rounded-2xl object-cover"
        width={width}
        height={height}
        priority={false}
      />

      <figcaption className="px-3 pb-2 pt-2 text-xs font-sans text-slate-400">
        {caption ?? "Narrative panel generated via Replicate + analytical pipeline."}
      </figcaption>
    </figure>
  );
}
