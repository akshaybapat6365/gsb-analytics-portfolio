import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects/catalog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${site.url}/resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    ...projects.map((project) => ({
      url: `${site.url}/projects/${project.slug}`,
      lastModified: new Date(project.homepage.asOf),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
