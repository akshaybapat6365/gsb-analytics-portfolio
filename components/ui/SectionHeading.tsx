import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-slate-300">
          {description}
        </p>
      ) : null}
    </div>
  );
}
