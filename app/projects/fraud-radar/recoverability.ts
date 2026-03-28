export type FraudRouteProbe = "none" | "loading" | "error";

export function resolveFraudRouteProbe(
  value: string | string[] | undefined | null,
): FraudRouteProbe {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate === "loading" || candidate === "error") {
    return candidate;
  }

  return "none";
}
