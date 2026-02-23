import { cn } from "@/lib/cn";

type ProjectBackdropProps = {
  slug: string;
  className?: string;
};

const slugTint: Record<string, string> = {
  "ord-lga-price-war": "from-[rgba(126,52,34,0.5)] via-transparent to-[rgba(162,124,74,0.45)]",
  "fraud-radar": "from-[rgba(123,31,31,0.56)] via-transparent to-[rgba(145,98,51,0.4)]",
  "target-shrink": "from-[rgba(142,92,32,0.56)] via-transparent to-[rgba(125,58,45,0.44)]",
  "starbucks-pivot": "from-[rgba(68,87,58,0.52)] via-transparent to-[rgba(130,104,66,0.44)]",
  "tesla-nacs": "from-[rgba(74,70,66,0.54)] via-transparent to-[rgba(133,80,52,0.42)]",
  "netflix-roi": "from-[rgba(97,31,31,0.56)] via-transparent to-[rgba(154,114,60,0.44)]",
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
