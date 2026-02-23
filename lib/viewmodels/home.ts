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
  problem: string;
  methodPlain: string;
  resultLabel: string;
  resultValue: string;
  claim: string;
  claimFraming: string;
  evidenceLevel: HomepageEvidenceLevel;
  evidenceBadge: HomeEvidenceBadge;
  source: string;
  asOf: string;
  provenanceShort: string;
  provenanceLong: string;
  vizType: HomeVizType;
  spark: number[];
  markerLabel: string;
  annotation: string;
  accent: Project["accent"];
  href: string;
};

export type HomeCredibilityVM = {
  dataPolicy: string;
  deliverables: string[];
  validationSteps: string[];
  audience: string[];
  trustNotes: string[];
  cta: { label: string; href: string };
};

export type HomeHeroVM = {
  eyebrow: string;
  headline: string;
  identityLine: string;
  subhead: string;
  proofLine: string;
  proofCards: Array<{ title: string; detail: string }>;
  featured: {
    title: string;
    decision: string;
    outputLabel: string;
    outputValue: string;
    evidenceLabel: string;
    source: string;
    asOf: string;
    href: string;
  };
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
      label: "Simulator Theses",
      value: String(input.length).padStart(2, "0"),
      hint: "Pricing, fraud, shrink, geospatial, infrastructure, content",
      tone: "primary",
    },
    {
      label: "Evidence-tagged Claims",
      value: String(input.length).padStart(2, "0"),
      hint: `${mixedCount} mixed · ${modeledCount} modeled, all with source and as-of`,
      tone: "neutral",
    },
    {
      label: "Decision Outputs",
      value: "04",
      hint: "ROI, NPV, Alpha, and ATE delivered in each case-study flow",
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
    project.homepage.problem,
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
      problem: project.homepage.problem,
      methodPlain: project.homepage.methodPlain,
      resultLabel: project.homepage.resultLabel,
      resultValue: project.homepage.resultValue,
      claim: project.homepage.claim,
      claimFraming: project.homepage.claimFraming,
      evidenceLevel: project.homepage.evidenceLevel,
      evidenceBadge,
      source: project.homepage.source,
      asOf: project.homepage.asOf,
      provenanceShort: `${project.homepage.source} · as-of ${project.homepage.asOf}`,
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

function buildCredibility(): HomeCredibilityVM {
  return {
    dataPolicy: site.dataPolicy.mode,
    deliverables: [
      "Scenario controls with sensitivity rails",
      "Evidence-tagged outputs with provenance",
      "Decision memo style recommendation blocks",
    ],
    validationSteps: [
      "Data coverage and provenance checks",
      "Assumption stress testing per scenario",
      "Decision recommendation with uncertainty bounds",
    ],
    audience: [
      "MBB strategy and operations",
      "PE/VC value creation",
      "Big Tech strategy and finance",
    ],
    trustNotes: [
      "All modeled outputs are explicitly labeled to avoid false certainty.",
      "Each thesis includes data provenance and as-of dates.",
      "Project pages expose assumptions before recommendations.",
    ],
    cta: { label: "Contact for Strategy Discussion", href: site.links.email },
  };
}

export function buildHomePageViewModel(inputProjects: Project[] = projects): HomePageViewModel {
  const featured = inputProjects[0];

  return {
    hero: {
      eyebrow: "Decision Intelligence Portfolio",
      headline: "Data products for operating decisions, not dashboard theater.",
      identityLine:
        "Decision science and analytics product design. End-to-end: data → model → simulator UI → decision memo.",
      subhead:
        "Interactive strategy simulators that show what changed, what it is worth, and what action to take now.",
      proofLine:
        "6 simulator theses across pricing, fraud, shrink, geospatial strategy, infrastructure, and content allocation.",
      proofCards: [
        {
          title: "Evidence tags on every claim",
          detail: "Each numeric output shows evidence level, source lineage, and as-of date before click-through.",
        },
        {
          title: "Decision output contract",
          detail: "Every simulator resolves to recommendation + sensitivity rails + uncertainty notes.",
        },
      ],
      featured: {
        title: featured.homepage.homepageTitle,
        decision: featured.homepage.problem,
        outputLabel: featured.homepage.resultLabel,
        outputValue: featured.homepage.resultValue,
        evidenceLabel: featured.homepage.evidenceLevel.toUpperCase(),
        source: featured.homepage.source,
        asOf: featured.homepage.asOf,
        href: `/projects/${featured.slug}`,
      },
      ctaPrimary: { label: "Explore Simulators", href: "/projects" },
      ctaSecondary: { label: "View Resume", href: "/resume" },
      modes: buildHeroModes(),
    },
    kpis: buildKpis(inputProjects),
    cards: buildCards(inputProjects),
    credibility: buildCredibility(),
  };
}
