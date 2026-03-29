export type StarbucksRouteProbe = "none" | "loading" | "error";

export function resolveStarbucksRouteProbe(
  value: string | string[] | undefined | null,
): StarbucksRouteProbe {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate === "loading" || candidate === "error") {
    return candidate;
  }

  return "none";
}
