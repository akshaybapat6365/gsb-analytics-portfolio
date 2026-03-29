import type { HomepageEvidenceLevel, ProjectHomepageCard } from "@/lib/projects/catalog";

export function formatEvidenceLevel(level: HomepageEvidenceLevel) {
  if (level === "real") return "Real";
  if (level === "mixed") return "Mixed";
  return "Modeled";
}

export function buildProjectTrustLabels(summary: ProjectHomepageCard) {
  const evidenceLabel = formatEvidenceLevel(summary.evidenceLevel);

  return {
    evidenceLabel,
    evidenceBadgeLabel: evidenceLabel.toUpperCase(),
    evidenceLine: `${evidenceLabel.toUpperCase()} · ${summary.source} · as-of ${summary.asOf}`,
    sourceLabel: summary.source,
    freshnessLabel: `As-of ${summary.asOf}`,
  };
}
