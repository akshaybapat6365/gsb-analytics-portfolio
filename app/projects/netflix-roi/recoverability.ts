export type NetflixRouteProbe = "none" | "loading" | "error";

export function resolveNetflixRouteProbe(
  value: string | string[] | undefined | null,
): NetflixRouteProbe {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate === "loading" || candidate === "error") {
    return candidate;
  }

  return "none";
}
