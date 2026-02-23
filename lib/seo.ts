import type { Metadata } from "next";
import type { Project } from "@/lib/projects/catalog";
import { site } from "@/lib/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  theme?: string;
};

const THEME_TO_OG = {
  default: "ord-lga-price-war",
  pricing: "ord-lga-price-war",
  fraud: "fraud-radar",
  ops: "target-shrink",
  geo: "starbucks-pivot",
  infra: "tesla-nacs",
  portfolio: "netflix-roi",
} as const;

function buildOgImageUrl(title: string, theme: string) {
  const params = new URLSearchParams({
    title,
    theme,
  });
  return `${site.url}/api/og?${params.toString()}`;
}

function canonicalUrl(path: string) {
  if (path === "/") return site.url;
  return `${site.url}${path}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  theme = THEME_TO_OG.default,
}: PageMetadataInput): Metadata {
  const absoluteUrl = canonicalUrl(path);
  const imageUrl = buildOgImageUrl(title, theme);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: "VB Labs",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildProjectMetadata(project: Project): Metadata {
  return buildPageMetadata({
    title: project.homepage.homepageTitle,
    description: `${project.subtitle}. ${project.homepage.claimFraming}. ${project.homepage.limitation}`,
    path: `/projects/${project.slug}`,
    theme: THEME_TO_OG[project.domain],
  });
}

export function buildPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    description: site.tagline,
    url: site.url,
    sameAs: [site.links.linkedin, site.links.github],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
  };
}

export function buildProjectSchema(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.homepage.homepageTitle,
    headline: project.title,
    description: `${project.businessQuestion} ${project.bluf}`,
    url: `${site.url}/projects/${project.slug}`,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: site.name,
      url: site.url,
    },
    dateModified: project.homepage.asOf,
    genre: "Analytics case study",
    about: [project.domain, project.outputType, project.methods.join(", ")],
    keywords: [
      project.domain,
      project.outputType,
      project.homepage.evidenceLevel,
      ...project.methods,
    ],
    isBasedOn: project.homepage.source,
    mainEntityOfPage: `${site.url}/projects/${project.slug}`,
  };
}
