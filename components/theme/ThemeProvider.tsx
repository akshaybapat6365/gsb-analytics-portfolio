import type { ProjectSlug } from "@/lib/projects/catalog";
import { getThemePack, themeToStyleVars } from "@/lib/theme/theme-registry";

type ThemeProviderProps = {
  slug: ProjectSlug;
  children: React.ReactNode;
};

export function ThemeProvider({ slug, children }: ThemeProviderProps) {
  const theme = getThemePack(slug);

  return (
    <div
      className="font-feature relative"
      data-project-theme={theme.id}
      data-layout-mode={theme.layoutMode}
      data-heading-case={theme.typeMode.headingCase}
      data-motion-motif={theme.motion.motif}
      style={themeToStyleVars(theme)}
    >
      <div aria-hidden="true" className="project-backdrop absolute inset-0 -z-10" />
      <div aria-hidden="true" className="project-motion-layer absolute inset-0 -z-10" />
      {children}
    </div>
  );
}
