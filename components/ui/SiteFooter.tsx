import { Github, Linkedin, Mail } from "lucide-react";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-white/[0.05]">
      <div className="mx-auto w-full max-w-[1420px] px-5 py-14 sm:px-7 lg:px-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* ── Task 33: Personal branding ───────────── */}
          <div>
            <p className="font-display text-[20px] font-medium leading-none text-white">
              {site.name}
            </p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Decision Science · Strategy Simulation
            </p>
          </div>

          {/* ── Task 34: Social links ────────────────── */}
          <div className="flex items-center gap-4">
            <a
              href={site.links.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-slate-600 transition-colors duration-200 hover:text-slate-300"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-slate-600 transition-colors duration-200 hover:text-slate-300"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={site.links.email}
              aria-label="Email"
              className="text-slate-600 transition-colors duration-200 hover:text-slate-300"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.04] pt-4">
          <p className="font-mono text-[10px] text-slate-600">© 2026</p>
        </div>
      </div>
    </footer>
  );
}
