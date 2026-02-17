export type ProjectSlug =
  | "ord-lga-price-war"
  | "fraud-radar"
  | "target-shrink"
  | "starbucks-pivot"
  | "tesla-nacs"
  | "netflix-roi";

export type Project = {
  slug: ProjectSlug;
  title: string;
  subtitle: string;
  businessQuestion: string;
  bluf: string;
  methods: string[];
  accent: "cyan" | "emerald" | "crimson" | "amber";
};

export const projects: Project[] = [
  {
    slug: "ord-lga-price-war",
    title: "United vs. Delta: ORD–LGA Price War Simulator",
    subtitle: "Reinforcement learning counterfactual pricing in a competitive market",
    businessQuestion:
      "Could United have captured an additional $18M in Q2 2023 revenue on ORD–LGA by using reinforcement learning instead of historical pricing?",
    bluf:
      "A simulated DQN policy paired with an inferred competitor response suggests meaningful incremental revenue on high-shock days by trading off short-term yield for share when demand is elastic.",
    methods: ["Deep Q-Networks", "Inverse policy inference", "Multi-agent simulation"],
    accent: "cyan",
  },
  {
    slug: "fraud-radar",
    title: "Shorting Nikola: Pre-Collapse Fraud Detection Dashboard",
    subtitle: "Accounting ratios + MD&A language signals for early-warning risk",
    businessQuestion:
      "Using only public filings, can we flag accounting irregularities 6–12 months ahead of enforcement actions?",
    bluf:
      "Combining Beneish-style accounting signals with linguistic deception markers yields a ranked risk score and a similarity graph that clusters “known bad” patterns before headline events.",
    methods: ["Beneish M-Score", "Text features", "Tree-based risk scoring"],
    accent: "crimson",
  },
  {
    slug: "target-shrink",
    title: "Target’s $1.2B Shrink Problem: Loss Prevention Simulator",
    subtitle: "Bayesian decision theory for the false-positive vs. theft tradeoff",
    businessQuestion:
      "What’s the ROI of AI theft detection at self-checkout after accounting for false positives and customer LTV?",
    bluf:
      "The optimal stop rule is not “maximize accuracy” but “maximize expected value”: detain only when the posterior exceeds a threshold that reflects LTV-weighted false-positive costs.",
    methods: ["Temporal classification", "Bayesian decision policy", "Store-level economics"],
    accent: "amber",
  },
  {
    slug: "starbucks-pivot",
    title: "Starbucks Suburban Pivot: Remote Work Geo-Analytics",
    subtitle: "Causal inference + geospatial decision support (Denver case study)",
    businessQuestion:
      "Which suburban stores should convert to pickup-only/drive-thru-only to maximize post-COVID profitability?",
    bluf:
      "A Diff-in-Diff design estimates a significant traffic shift away from office-adjacent stores; a portfolio tool recommends surgery actions by WFH exposure and local demand.",
    methods: ["Difference-in-Differences", "Scenario planning", "3D geo-viz"],
    accent: "emerald",
  },
  {
    slug: "tesla-nacs",
    title: "Tesla’s NACS Gambit: EV Charging War Game",
    subtitle: "Spatial game theory + network effects along I-5 (Harris Ranch focus)",
    businessQuestion:
      "Where should Tesla build vs. abandon stations to maximize network effects while minimizing cannibalization?",
    bluf:
      "A Stackelberg-style placement model highlights “anxiety desert” zones where first-mover advantage dominates, and saturated zones where capex is value-destructive.",
    methods: ["Spatial games", "Agent-style demand simulation", "NPV modeling"],
    accent: "cyan",
  },
  {
    slug: "netflix-roi",
    title: "Netflix’s $17B Content Bet: Shonda Rhimes ROI Autopsy",
    subtitle: "Synthetic control + Bayesian time-series decision intelligence",
    businessQuestion:
      "Did a $150M deal drive subscriber acquisition or retention, and which titles justified their budgets?",
    bluf:
      "Synthetic control estimates a measurable incremental adds signal, but the dominant value comes from retention. A Pareto frontier identifies budget-efficient greenlight candidates.",
    methods: ["Synthetic control", "BSTS-style modeling", "Portfolio optimization"],
    accent: "emerald",
  },
];

export function getProject(slug: ProjectSlug) {
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    throw new Error(`Unknown project slug: ${slug}`);
  }
  return project;
}

export function isProjectSlug(slug: string): slug is ProjectSlug {
  return projects.some((p) => p.slug === slug);
}
