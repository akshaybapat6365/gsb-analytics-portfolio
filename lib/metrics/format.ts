export function formatUSD(value: number, opts?: { compact?: boolean }) {
  const compact = opts?.compact ?? true;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

export function formatNumber(value: number, opts?: { digits?: number }) {
  const digits = opts?.digits ?? 0;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPct(value: number, opts?: { digits?: number }) {
  const digits = opts?.digits ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: digits,
  }).format(value);
}

