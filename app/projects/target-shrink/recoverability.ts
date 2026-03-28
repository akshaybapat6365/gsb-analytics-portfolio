export type ShrinkRouteProbe = "none" | "loading" | "error";

export function resolveShrinkRouteProbe(
  value: string | string[] | undefined | null,
): ShrinkRouteProbe {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate === "loading" || candidate === "error") {
    return candidate;
  }

  return "none";
}
