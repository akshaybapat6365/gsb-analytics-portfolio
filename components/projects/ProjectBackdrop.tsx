import { existsSync } from "node:fs";
import path from "node:path";

import Image from "next/image";

import { cn } from "@/lib/cn";

type ProjectBackdropProps = {
  slug: string;
  className?: string;
};

function resolveBackdrop(slug: string): { kind: "video" | "image"; src: string } {
  const publicDir = path.join(process.cwd(), "public", "assets", slug);

  for (const name of ["loop.mp4", "loop.webm"]) {
    if (existsSync(path.join(publicDir, name))) {
      return { kind: "video", src: `/assets/${slug}/${name}` };
    }
  }

  for (const name of ["hero.webp", "hero.png", "hero.jpg", "hero.svg"]) {
    if (existsSync(path.join(publicDir, name))) {
      return { kind: "image", src: `/assets/${slug}/${name}` };
    }
  }

  return { kind: "image", src: "/assets/generic/hero.svg" };
}

export function ProjectBackdrop({ slug, className }: ProjectBackdropProps) {
  const resolved = resolveBackdrop(slug);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
    >
      {resolved.kind === "video" ? (
        <video
          className="project-backdrop-media absolute inset-0 h-full w-full object-cover opacity-58"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={resolved.src} />
        </video>
      ) : (
        <Image
          src={resolved.src}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 960px"
          className="project-backdrop-media object-cover opacity-52"
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(1100px_560px_at_20%_18%,rgba(0,0,0,0.25),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.70),rgba(2,6,23,0.55),rgba(2,6,23,0.80))]" />
      <div className="project-backdrop-sweep absolute inset-0" />
      <div className="absolute inset-0 mix-blend-overlay opacity-70 [mask-image:radial-gradient(circle_at_45%_25%,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_75%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] [background-size:84px_84px]" />
      </div>
    </div>
  );
}
