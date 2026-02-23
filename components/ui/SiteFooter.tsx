import { Github, Linkedin, Mail } from "lucide-react";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-20 border-t border-white/12 bg-black/24">
      <div className="mx-auto w-full max-w-[1420px] px-5 py-12 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-[980px]">
          <p className="font-display text-[30px] leading-none text-slate-100 sm:text-[34px]">{site.name}</p>
          <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.18em] text-slate-300">Decision Science · Strategy Simulation</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={site.links.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="footer-social"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="footer-social"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            <a href={site.links.email} aria-label="Email" className="footer-social">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </a>
          </div>

          <div className="chapter-divider mt-8" />

          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Built with Next.js, D3, deck.gl, and attention to detail. Evidence-first. Decision-complete.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            © 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
