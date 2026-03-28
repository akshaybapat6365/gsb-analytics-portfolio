import Link from "next/link";
import { RouteLoading } from "@/components/ui/RouteLoading";
import { cn } from "@/lib/cn";
import type { OrdLgaRouteProbe } from "./recoverability";

type RecoverabilityProbeProps = {
  probe: Exclude<OrdLgaRouteProbe, "none">;
};

function RecoveryActions() {
  return (
    <div className="mt-6 flex flex-wrap gap-3" data-testid="ordlga-recovery-actions">
      <Link
        href="/projects/ord-lga-price-war"
        className="inline-flex items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition-colors hover:bg-amber-200 hover:no-underline"
      >
        Open live route
      </Link>
      <Link
        href="/projects"
        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 no-underline transition-colors hover:bg-white/[0.07] hover:no-underline"
      >
        Back to projects
      </Link>
    </div>
  );
}

export function RecoverabilityProbe({ probe }: RecoverabilityProbeProps) {
  if (probe === "loading") {
    return (
      <div className="space-y-6" data-testid="ordlga-route-probe" data-probe={probe}>
        <RouteLoading
          title="ORD–LGA Price War Simulator"
          subtitle="Recoverability probe active: route-level loading state remains visible before the live route is restored."
        />
        <section className="glass rounded-2xl p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Recovery path
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            This deterministic loading probe exists so browser validation can confirm that ORD–LGA loading copy stays route-specific and that users can recover without guessing.
          </p>
          <RecoveryActions />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="ordlga-route-probe" data-probe={probe}>
      <div className="glass-strong rounded-3xl p-8">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Route Error
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          ORD–LGA Price War Simulator
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Recoverability probe active: this route-level failure view keeps the recovery path explicit so validators can confirm the fallback stays user-visible under a controlled condition.
        </p>
        <RecoveryActions />
      </div>

      <div className={cn("terminal overflow-hidden")}> 
        <div className="border-b border-white/10 bg-white/5 px-6 py-4">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Diagnostics
          </p>
        </div>
        <div className="space-y-2 px-6 py-6 font-mono text-xs text-slate-300">
          <div>
            <span className="text-slate-400">message:</span> Recoverability probe triggered with <code>?routeProbe=error</code>
          </div>
          <div>
            <span className="text-slate-400">hint:</span> Use the recovery actions above to return to the live route or the projects index.
          </div>
        </div>
      </div>
    </div>
  );
}
