import { cn } from "@/lib/cn";

type ProjectBackdropProps = {
  slug: string;
  className?: string;
};

const slugTint: Record<string, string> = {
  "ord-lga-price-war": "from-[rgba(246,178,74,0.48)] via-transparent to-[rgba(52,211,153,0.42)]",
  "fraud-radar": "from-[rgba(255,45,170,0.54)] via-transparent to-[rgba(255,194,71,0.4)]",
  "target-shrink": "from-[rgba(245,200,75,0.52)] via-transparent to-[rgba(88,196,221,0.4)]",
  "starbucks-pivot": "from-[rgba(47,191,113,0.5)] via-transparent to-[rgba(242,194,107,0.42)]",
  "tesla-nacs": "from-[rgba(0,229,255,0.52)] via-transparent to-[rgba(166,255,0,0.4)]",
  "netflix-roi": "from-[rgba(229,9,20,0.54)] via-transparent to-[rgba(212,175,55,0.42)]",
};

export function ProjectBackdrop({ slug, className }: ProjectBackdropProps) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 z-0", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.64))]" />
      <div className={cn("absolute inset-0 bg-gradient-to-br", slugTint[slug] ?? slugTint["ord-lga-price-war"])} />
      <div className="absolute inset-0 opacity-55 [mask-image:radial-gradient(circle_at_46%_22%,rgba(0,0,0,1)_28%,rgba(0,0,0,0)_78%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(182,169,151,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(182,169,151,0.12)_1px,transparent_1px)] [background-size:74px_74px]" />
      </div>
    </div>
  );
}
