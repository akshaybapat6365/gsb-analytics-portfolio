export type ProjectSlug =
  | "ord-lga-price-war"
  | "fraud-radar"
  | "target-shrink"
  | "starbucks-pivot"
  | "tesla-nacs"
  | "netflix-roi";

export type HomepageEvidenceLevel = "real" | "mixed" | "modeled";
export type HomepageClaimType =
  | "real-measurement"
  | "mixed-counterfactual"
  | "illustrative-simulation"
  | "backtest-simulated";
export type HomeVizType =
  | "matrix"
  | "timeline"
  | "frontier"
  | "band"
  | "nodes"
  | "bubbles";

export type ProjectDomain = "pricing" | "fraud" | "ops" | "geo" | "infra" | "portfolio";
export type ProjectOutputType = "roi-npv" | "ate" | "risk-score" | "frontier";

export type ProjectHomepageCard = {
  homepageTitle: string;
  homepageSubtitle: string;
  problem: string;
  methodPlain: string;
  resultLabel: string;
  resultValue: string;
  claim: string;
  claimFraming: string;
  claimType: HomepageClaimType;
  timeframe?: string;
  limitation: string;
  evidenceLevel: HomepageEvidenceLevel;
  source: string;
  asOf: string;
  provenanceLong: string;
  vizType: HomeVizType;
  spark: number[];
  markerLabel: string;
  annotation: string;
};

export type Project = {
  slug: ProjectSlug;
  title: string;
  subtitle: string;
  businessQuestion: string;
  bluf: string;
  methods: string[];
  themeId: ProjectSlug;
  domain: ProjectDomain;
  outputType: ProjectOutputType;
  accent:
    | "market-competition"
    | "forensic-risk"
    | "retail-operations"
    | "geo-portfolio"
    | "infrastructure-strategy"
    | "content-capital";
  homepage: ProjectHomepageCard;
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
    themeId: "ord-lga-price-war",
    domain: "pricing",
    outputType: "roi-npv",
    accent: "market-competition",
    homepage: {
      homepageTitle: "United vs Delta ORD-LGA Pricing Simulator",
      homepageSubtitle: "Case study · mixed evidence with modeled policy response",
      problem: "Could policy-learning pricing outperform the legacy pricing desk on ORD-LGA?",
      methodPlain: "DQN fare policy with inferred competitor response.",
      resultLabel: "Modeled incremental Q2 lift",
      resultValue: "$567K",
      claim:
        "Counterfactual policy captures shock-day share by reducing late-window overpricing.",
      claimFraming: "Mixed evidence · modeled counterfactual",
      claimType: "mixed-counterfactual",
      timeframe: "Q2 2023 simulated replay window",
      limitation: "Competitor policy is inferred, not observed from internal airline systems.",
      evidenceLevel: "mixed",
      source: "DOT DB1B anchors + modeled policy simulation",
      asOf: "2026-02-21",
      provenanceLong:
        "Observed route-day anchors are calibrated from open airfare references; policy and competitor response are modeled for counterfactual analysis.",
      vizType: "matrix",
      spark: [22, 28, 31, 26, 34, 39, 36, 42, 45, 48],
      markerLabel: "$47K day",
      annotation: "Regret clusters in weekday, short-booking windows.",
    },
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
    themeId: "fraud-radar",
    domain: "fraud",
    outputType: "risk-score",
    accent: "forensic-risk",
    homepage: {
      homepageTitle: "Filings Risk Radar",
      homepageSubtitle: "Case study · modeled fraud-risk ranking from public filing proxies",
      problem: "Can filings-only signals flag fraud-risk issuers before enforcement?",
      methodPlain: "Accounting manipulation proxies + linguistic deception features.",
      resultLabel: "Illustrative simulated spread",
      resultValue: "+34 risk-score pts",
      claim:
        "Risk spikes appear ahead of known collapse windows in synthetic backtest runs.",
      claimFraming: "Modeled backtest · illustrative only",
      claimType: "backtest-simulated",
      timeframe: "Simulated 12-month rolling backtest",
      limitation: "Backtest labels and trajectories are synthetic and not legal determinations.",
      evidenceLevel: "modeled",
      source: "Synthetic filing feature panel + risk backtest",
      asOf: "2026-02-21",
      provenanceLong:
        "This module uses synthetic filing feature trajectories and synthetic event labels to stress-test an early warning ranking policy.",
      vizType: "timeline",
      spark: [18, 19, 22, 21, 27, 30, 34, 37, 41, 44],
      markerLabel: "Lead signal",
      annotation: "Deception intensity rises ahead of event dates.",
    },
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
    themeId: "target-shrink",
    domain: "ops",
    outputType: "roi-npv",
    accent: "retail-operations",
    homepage: {
      homepageTitle: "Checkout Loss Threshold Simulator",
      homepageSubtitle: "Case study · modeled stop-rule economics for shrink prevention",
      problem:
        "Where is the economic threshold between theft recovery and false-positive customer loss?",
      methodPlain: "Bayesian stop policy tuned to LTV-weighted false-positive costs.",
      resultLabel: "Policy threshold signal",
      resultValue: "P(theft) > 0.85",
      claim:
        "Expected-value objective outperforms accuracy-only rules in store-level economics.",
      claimFraming: "Modeled operations policy",
      claimType: "illustrative-simulation",
      timeframe: "Synthetic event stream policy horizon",
      limitation: "Store traffic and event labels are synthetic approximations of checkout behavior.",
      evidenceLevel: "modeled",
      source: "Synthetic checkout event stream + cost frontier",
      asOf: "2026-02-21",
      provenanceLong:
        "Transactions and incident labels are synthetic and designed to emulate checkout behavior classes for policy-threshold sensitivity analysis.",
      vizType: "frontier",
      spark: [11, 13, 16, 15, 20, 24, 23, 27, 30, 32],
      markerLabel: "0.85 cutoff",
      annotation: "Net value decays quickly above aggressive stop rates.",
    },
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
    themeId: "starbucks-pivot",
    domain: "geo",
    outputType: "ate",
    accent: "geo-portfolio",
    homepage: {
      homepageTitle: "Suburban Portfolio Pivot Simulator",
      homepageSubtitle: "Case study · modeled DiD strategy for post-WFH store actions",
      problem:
        "Which suburban stores should be converted, reconfigured, or exited under WFH shifts?",
      methodPlain: "Difference-in-Differences with scenario-driven recommendation rules.",
      resultLabel: "Portfolio surgery candidates",
      resultValue: "2,400-store screen",
      claim:
        "WFH exposure separates office-adjacent declines from residential-adjacent resilience.",
      claimFraming: "Modeled geo-portfolio recommendation",
      claimType: "illustrative-simulation",
      timeframe: "Post-COVID scenario interval",
      limitation: "Store-level profitability deltas are scenario outputs, not reported store P&Ls.",
      evidenceLevel: "modeled",
      source: "Denver scenario payload + DID summary outputs",
      asOf: "2026-02-21",
      provenanceLong:
        "Store-level exposures and intervention outputs are generated from scenario assumptions with DID-inspired summary estimates.",
      vizType: "band",
      spark: [26, 25, 24, 27, 30, 33, 35, 37, 39, 40],
      markerLabel: "ATE split",
      annotation: "Pre-trend holds; post-period divergence drives intervention list.",
    },
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
    themeId: "tesla-nacs",
    domain: "infra",
    outputType: "roi-npv",
    accent: "infrastructure-strategy",
    homepage: {
      homepageTitle: "I-5 Charging Node Economics",
      homepageSubtitle: "Case study · mixed evidence with modeled corridor outcomes",
      problem:
        "Where does new I-5 charging capacity create network value versus cannibalization?",
      methodPlain: "Spatial game-theory placement with corridor demand simulation.",
      resultLabel: "Illustrative node output",
      resultValue: "NPV: -$1.2M example",
      claim:
        "Some high-traffic nodes still destroy value when cannibalization dominates capture.",
      claimFraming: "Mixed evidence · modeled node economics",
      claimType: "mixed-counterfactual",
      timeframe: "I-5 corridor scenario run",
      limitation: "Utilization and cannibalization are modeled with stylized adoption assumptions.",
      evidenceLevel: "mixed",
      source: "DOE station anchors + modeled node economics",
      asOf: "2026-02-21",
      provenanceLong:
        "Station inventory references are open-source; utilization, capture, and cannibalization economics are simulated under stylized demand assumptions.",
      vizType: "nodes",
      spark: [14, 18, 17, 20, 25, 24, 29, 31, 35, 38],
      markerLabel: "Cannibalization",
      annotation: "Harris Ranch remains strategic under anxiety-sensitive demand.",
    },
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
    themeId: "netflix-roi",
    domain: "portfolio",
    outputType: "frontier",
    accent: "content-capital",
    homepage: {
      homepageTitle: "Content ROI Allocation Frontier",
      homepageSubtitle: "Case study · modeled acquisition-retention tradeoff",
      problem:
        "Did premium content spend drive acquisition, retention, or both at portfolio level?",
      methodPlain: "Synthetic-control baseline plus retention-weighted portfolio frontier.",
      resultLabel: "Portfolio allocation output",
      resultValue: "Acquisition vs retention frontier",
      claim:
        "Retention-weighted titles dominate acquisition-only picks in modeled capital efficiency.",
      claimFraming: "Modeled portfolio optimization",
      claimType: "illustrative-simulation",
      timeframe: "Synthetic slate planning cycle",
      limitation: "Title economics are synthetic and intended for scenario stress testing only.",
      evidenceLevel: "modeled",
      source: "Synthetic content panel + frontier optimizer",
      asOf: "2026-02-21",
      provenanceLong:
        "This module uses synthetic title-level economics and synthetic control-like counterfactual trajectories for portfolio budgeting scenarios.",
      vizType: "bubbles",
      spark: [28, 29, 33, 30, 35, 39, 41, 40, 44, 47],
      markerLabel: "Retention edge",
      annotation: "Greenlight score degrades as buzz half-life shortens.",
    },
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
