import { cn } from "@/lib/cn";
import { BACKDROP_TINT_BY_SLUG } from "@/lib/chartTheme";

type ProjectBackdropProps = {
  slug: string;
  className?: string;
};

export function ProjectBackdrop({ slug, className }: ProjectBackdropProps) {
  const tint = BACKDROP_TINT_BY_SLUG[slug as keyof typeof BACKDROP_TINT_BY_SLUG]
    ?? BACKDROP_TINT_BY_SLUG["ord-lga-price-war"];

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 z-0", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.64))]" />
      <div className={cn("absolute inset-0 bg-gradient-to-br", tint)} />
      <div className="absolute inset-0 opacity-55 [mask-image:radial-gradient(circle_at_46%_22%,rgba(0,0,0,1)_28%,rgba(0,0,0,0)_78%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(182,169,151,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(182,169,151,0.12)_1px,transparent_1px)] [background-size:74px_74px]" />
      </div>
    </div>
  );
}

