import { cn } from "@/lib/cn";
import type { DataStatus } from "@/lib/schemas/common";

type DataBadgeProps = {
  status: DataStatus;
  className?: string;
};

const styleByStatus: Record<DataStatus, string> = {
  ok: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  stale: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  unavailable: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

const labelByStatus: Record<DataStatus, string> = {
  ok: "Real data: live",
  stale: "Live feed: stale",
  unavailable: "Live feed: unavailable",
};

export function DataBadge({ status, className }: DataBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium tracking-[0.02em]",
        styleByStatus[status],
        className,
      )}
    >
      {labelByStatus[status]}
    </span>
  );
}
