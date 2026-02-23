export const DATA_POLICY_MODES = [
  "strict-real",
  "baseline-fallback",
  "synthetic-demo",
] as const;
export type DataPolicyMode = (typeof DATA_POLICY_MODES)[number];

function resolveDataPolicyMode(raw: string | undefined): DataPolicyMode {
  if (!raw) return "baseline-fallback";
  if (raw === "strict-real") return "strict-real";
  if (raw === "baseline-fallback") return "baseline-fallback";
  if (raw === "synthetic-demo") return "synthetic-demo";
  return "baseline-fallback";
}

export const runtimeDataPolicy = {
  mode: resolveDataPolicyMode(process.env.NEXT_PUBLIC_DATA_POLICY_MODE),
} as const;

export const site = {
  name: "Vaibhav Bapat",
  role: "Decision Science · Business Analytics",
  tagline: "Interactive simulation products for pricing, risk, and operating strategy",
  location: "United States",
  dataPolicy: runtimeDataPolicy,
  links: {
    email: "mailto:vaibhavb@worktechmail.com",
    linkedin: "https://www.linkedin.com",
    github: "https://github.com",
    resume: "/resume",
  },
} as const;
