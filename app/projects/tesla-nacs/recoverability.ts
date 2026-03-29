export type EvRouteProbe = "none" | "loading" | "error";

export function resolveEvRouteProbe(
  value: string | string[] | undefined | null,
): EvRouteProbe {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate === "loading" || candidate === "error") {
    return candidate;
  }

  return "none";
}
