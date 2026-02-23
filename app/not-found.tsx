import Link from "next/link";

export default function NotFound() {
  return (
    <section className="surface-primary relative overflow-hidden p-7 sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(860px_420px_at_16%_10%,rgba(178,67,67,0.16),transparent_64%),radial-gradient(860px_420px_at_88%_14%,rgba(198,153,98,0.16),transparent_64%)]"
      />
      <div className="relative z-10 max-w-3xl space-y-5">
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-rose-200">
          Signal Lost · 404
        </p>
        <h1 className="font-display text-[40px] leading-[1.04] text-slate-50 sm:text-[58px]">
          This route is off the grid.
        </h1>
        <p className="max-w-2xl text-[16px] leading-7 text-slate-200">
          The page may have moved, expired, or never existed. Continue with the project index or
          jump back to the home command surface.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 no-underline transition hover:no-underline hover:bg-amber-200"
          >
            View Simulators
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-slate-100 no-underline transition hover:no-underline hover:bg-white/[0.12]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}
