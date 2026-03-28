export type OrdLgaRouteProbe = "none" | "loading" | "error";

export function resolveOrdLgaRouteProbe(
  value: string | string[] | undefined | null,
): OrdLgaRouteProbe {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate === "loading" || candidate === "error") {
    return candidate;
  }

  return "none";
}
