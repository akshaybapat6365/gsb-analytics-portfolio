import { Github, Linkedin, Mail } from "lucide-react";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-24 border-t border-white/[0.08] bg-black/24">
      <div className="mx-auto w-full max-w-[1420px] px-5 py-12 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-[980px]">
          <p className="font-display text-[22px] leading-none text-white">{site.name}</p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Decision Science · Strategy Simulation
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href={site.links.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="footer-social-icon"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="footer-social-icon"
            >
              <Github className="h-4 w-4" />
            </a>
            <a href={site.links.email} aria-label="Email" className="footer-social-icon">
              <Mail className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8 border-t border-white/[0.04] pt-4">
            <p className="font-mono text-[11px] text-slate-600">© 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
