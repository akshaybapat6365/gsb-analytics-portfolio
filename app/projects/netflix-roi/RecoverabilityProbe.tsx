import Link from "next/link";
import { RouteLoading } from "@/components/ui/RouteLoading";
import { cn } from "@/lib/cn";
import type { NetflixRouteProbe } from "./recoverability";

type RecoverabilityProbeProps = {
  probe: Exclude<NetflixRouteProbe, "none">;
};

function RecoveryActions() {
  return (
    <div className="mt-6 flex flex-wrap gap-3" data-testid="netflix-recovery-actions">
      <Link
        href="/projects/netflix-roi"
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
      <div className="space-y-6" data-testid="netflix-route-probe" data-probe={probe}>
        <RouteLoading
          title="Netflix Content ROI Autopsy"
          subtitle="Recoverability probe active: ranking board, frontier scenario deck, and committee packet are rehydrating while the recovery path stays visible."
        />
        <section className="glass rounded-2xl p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Recovery path
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            This deterministic loading probe confirms the Netflix route keeps committee-grade allocation framing, modeled caveats, and a safe return path visible while the live slate board warms back up.
          </p>
          <RecoveryActions />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="netflix-route-probe" data-probe={probe}>
      <div className="glass-strong rounded-3xl p-8">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Route Error
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Netflix Content ROI Autopsy
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
          Recoverability probe active: this controlled failure keeps acquisition-versus-retention framing, modeled-output caveats, and committee recovery actions explicit so reviewers can safely reopen the live route or return to the projects library.
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
            <span className="text-slate-400">hint:</span> Use the recovery actions above to reopen the live committee board or return to the projects library.
          </div>
        </div>
      </div>
    </div>
  );
}
