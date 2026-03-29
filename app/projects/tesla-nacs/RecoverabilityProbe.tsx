import Link from "next/link";
import { RouteLoading } from "@/components/ui/RouteLoading";
import { cn } from "@/lib/cn";
import type { EvRouteProbe } from "./recoverability";

type RecoverabilityProbeProps = {
  probe: Exclude<EvRouteProbe, "none">;
};

function RecoveryActions() {
  return (
    <div className="mt-6 flex flex-wrap gap-3" data-testid="ev-recovery-actions">
      <Link
        href="/projects/tesla-nacs"
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
      <div className="space-y-6" data-testid="ev-route-probe" data-probe={probe}>
        <RouteLoading
          title="Tesla NACS War Game"
          subtitle="Recoverability probe active: corridor flows, node-state controls, and ranked build-order outputs are rehydrating while the recovery path stays visible."
        />
        <section className="glass rounded-2xl p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Recovery path
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            This deterministic loading probe confirms the Tesla route keeps corridor-specific copy, build-order posture, and a safe return path visible while the live war board warms back up.
          </p>
          <RecoveryActions />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="ev-route-probe" data-probe={probe}>
      <div className="glass-strong rounded-3xl p-8">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Route Error
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Tesla NACS War Game
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
          Recoverability probe active: this controlled failure keeps corridor build/hold/abandon posture, readiness caveats, and recovery actions explicit so operators can safely reopen the live route or return to the projects library.
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
            <span className="text-slate-400">hint:</span> Use the recovery actions above to reopen the live corridor war board or return to the projects library.
          </div>
        </div>
      </div>
    </div>
  );
}
