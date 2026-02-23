import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/15">
      <div className="mx-auto flex w-full max-w-[1420px] flex-col gap-3 px-5 py-9 text-sm text-slate-300 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <p className="flex items-center gap-2">
          <span className="font-display text-base text-slate-200">{site.name}</span>
          <span className="text-slate-500">·</span>
          <span className="font-sans text-slate-300">{site.tagline}</span>
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          Evidence tags enforced · accessibility-aware typography · scenario outputs with provenance
        </p>
      </div>
    </footer>
  );
}
