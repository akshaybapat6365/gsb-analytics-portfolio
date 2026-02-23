import { site } from "@/lib/site";
import {
  projects,
  type HomeVizType,
  type HomepageEvidenceLevel,
  type Project,
  type ProjectSlug,
} from "@/lib/projects/catalog";

export type HomeSignalModeId = "decision" | "risk" | "allocation";

export type HomeSignalMode = {
  id: HomeSignalModeId;
  label: string;
  scenario: string;
  description: string;
  axisLabel: string;
  xAxisLabel: string;
  unit: string;
  primarySeries: number[];
  secondarySeries: number[];
  tertiarySeries: number[];
  annotationIndex: number;
  annotationTitle: string;
  annotationDetail: string;
};

export type HomeKpiItem = {
  label: string;
  value: string;
  hint: string;
  tone: "primary" | "neutral" | "risk" | "success";
};

export type HomeEvidenceBadge = {
  level: HomepageEvidenceLevel;
  label: string;
  icon: string;
  tone: "real" | "mixed" | "modeled";
};

export type HomeProjectCardVM = {
  slug: ProjectSlug;
  title: string;
  subtitle: string;
  methodPlain: string;
  resultLabel: string;
  resultValue: string;
  claim: string;
  claimFraming: string;
  evidenceLevel: HomepageEvidenceLevel;
  evidenceBadge: HomeEvidenceBadge;
  evidenceMeta: string;
  provenanceLong: string;
  vizType: HomeVizType;
  spark: number[];
  markerLabel: string;
  annotation: string;
  accent: Project["accent"];
  href: string;
};

export type HomeCredibilityVM = {
  trustMetrics: string[];
};

export type HomeHeroVM = {
  eyebrow: string;
  headline: string;
  subhead: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  modes: HomeSignalMode[];
};

export type HomePageViewModel = {
  hero: HomeHeroVM;
  kpis: HomeKpiItem[];
  cards: HomeProjectCardVM[];
  credibility: HomeCredibilityVM;
};

function buildHeroModes(): HomeSignalMode[] {
  return [
    {
      id: "decision",
      label: "Decision Signal",
      scenario: "ORD-LGA pricing response snapshot",
      description: "Policy value spread under current scenario assumptions.",
      axisLabel: "Decision score (index)",
      xAxisLabel: "Planning window",
      unit: "index points",
      primarySeries: [52, 55, 58, 56, 61, 64, 63, 67, 70, 72],
      secondarySeries: [48, 49, 51, 53, 54, 56, 58, 59, 60, 62],
      tertiarySeries: [44, 46, 45, 47, 49, 50, 52, 53, 54, 55],
      annotationIndex: 6,
      annotationTitle: "Shock occurs",
      annotationDetail: "Policy path adapts one cycle earlier than baseline response.",
    },
    {
      id: "risk",
      label: "Risk Surface",
      scenario: "Cross-project downside pressure",
      description: "Downside pressure with stress and confidence overlays.",
      axisLabel: "Risk index",
      xAxisLabel: "Scenario step",
      unit: "risk units",
      primarySeries: [39, 41, 43, 44, 47, 49, 50, 52, 53, 55],
      secondarySeries: [35, 36, 38, 39, 40, 42, 43, 44, 45, 46],
      tertiarySeries: [42, 41, 40, 39, 38, 37, 36, 35, 34, 33],
      annotationIndex: 4,
      annotationTitle: "Risk inflection",
      annotationDetail: "Risk accelerates where mitigation lags confidence compression.",
    },
    {
      id: "allocation",
      label: "Allocation View",
      scenario: "Portfolio capital allocation efficiency",
      description: "Portfolio value concentration across strategic themes.",
      axisLabel: "Allocation efficiency",
      xAxisLabel: "Allocation step",
      unit: "efficiency points",
      primarySeries: [46, 48, 50, 53, 57, 60, 62, 64, 66, 69],
      secondarySeries: [43, 44, 46, 47, 49, 51, 54, 55, 57, 59],
      tertiarySeries: [58, 57, 56, 55, 53, 52, 50, 49, 48, 46],
      annotationIndex: 7,
      annotationTitle: "Concentration peak",
      annotationDetail: "Retention-led bets dominate efficiency after mid-horizon.",
    },
  ];
}

function buildKpis(input: Project[]): HomeKpiItem[] {
  const mixedCount = input.filter((project) => project.homepage.evidenceLevel === "mixed").length;
  const modeledCount = input.filter((project) => project.homepage.evidenceLevel === "modeled").length;

  return [
    {
      label: "Simulators shipped",
      value: String(input.length).padStart(2, "0"),
      hint: "Across pricing, fraud, retail ops, geospatial, infrastructure, and content allocation",
      tone: "primary",
    },
    {
      label: "Evidence-tagged claims",
      value: String(input.length).padStart(2, "0"),
      hint: `${mixedCount} mixed-evidence, ${modeledCount} modeled — all framed with source and as-of date`,
      tone: "neutral",
    },
    {
      label: "Output families",
      value: "04",
      hint: "ROI / NPV / ATE / Risk — delivered in every case study",
      tone: "success",
    },
  ];
}

function buildEvidenceBadge(level: HomepageEvidenceLevel): HomeEvidenceBadge {
  if (level === "real") {
    return { level, label: "REAL", icon: "●", tone: "real" };
  }
  if (level === "mixed") {
    return { level, label: "MIXED", icon: "▲", tone: "mixed" };
  }
  return { level, label: "MODELED", icon: "■", tone: "modeled" };
}

function validateProjectHomepage(project: Project) {
  const requiredFields = [
    project.homepage.homepageTitle,
    project.homepage.homepageSubtitle,
    project.homepage.methodPlain,
    project.homepage.resultLabel,
    project.homepage.resultValue,
    project.homepage.claim,
    project.homepage.claimFraming,
    project.homepage.source,
    project.homepage.asOf,
    project.homepage.provenanceLong,
    project.homepage.markerLabel,
  ];

  const hasMissing = requiredFields.some((value) => value.trim().length === 0);
  if (process.env.NODE_ENV !== "production" && hasMissing) {
    throw new Error(`Homepage evidence metadata missing for ${project.slug}`);
  }
}

function buildCards(input: Project[]): HomeProjectCardVM[] {
  return input.map((project) => {
    validateProjectHomepage(project);
    const evidenceBadge = buildEvidenceBadge(project.homepage.evidenceLevel);

    return {
      slug: project.slug,
      title: project.homepage.homepageTitle,
      subtitle: project.homepage.homepageSubtitle,
      methodPlain: project.homepage.methodPlain,
      resultLabel: project.homepage.resultLabel,
      resultValue: project.homepage.resultValue,
      claim: project.homepage.claim,
      claimFraming: project.homepage.claimFraming,
      evidenceLevel: project.homepage.evidenceLevel,
      evidenceBadge,
      evidenceMeta: `${project.homepage.evidenceLevel.toUpperCase()} · ${project.homepage.source} · as-of ${project.homepage.asOf}`,
      provenanceLong: project.homepage.provenanceLong,
      vizType: project.homepage.vizType,
      spark: project.homepage.spark,
      markerLabel: project.homepage.markerLabel,
      annotation: project.homepage.annotation,
      accent: project.accent,
      href: `/projects/${project.slug}`,
    };
  });
}

function buildCredibility(input: Project[]): HomeCredibilityVM {
  const modeledCount = input.filter((project) => project.homepage.evidenceLevel === "modeled").length;
  return {
    trustMetrics: [
      `${String(input.length)} simulators`,
      "4 decision outputs",
      "all evidence-tagged",
      `${modeledCount} modeled with explicit framing`,
      site.dataPolicy.mode,
    ],
  };
}

export function buildHomePageViewModel(inputProjects: Project[] = projects): HomePageViewModel {
  return {
    hero: {
      eyebrow: "Decision Science · Strategy Simulation · Analytics Engineering",
      headline: "Strategy simulators that move real capital.",
      subhead:
        "I build strategy simulators for pricing, fraud, operations, and capital allocation teams — each delivers a quantified decision with sensitivity analysis and evidence framing.",
      ctaPrimary: { label: "Explore Simulators", href: "/projects" },
      ctaSecondary: { label: "View Resume", href: "/resume" },
      modes: buildHeroModes(),
    },
    kpis: buildKpis(inputProjects),
    cards: buildCards(inputProjects),
    credibility: buildCredibility(inputProjects),
  };
}
