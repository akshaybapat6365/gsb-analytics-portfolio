import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { site } from "@/lib/site";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Resume", href: "/resume" },
];

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-white/[0.05]">
      <div className="mx-auto w-full max-w-[1420px] px-5 py-14 sm:px-7 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-4">
            <p className="font-display text-[20px] font-medium leading-none text-white">
              {site.name}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Decision Science · Strategy Simulation
            </p>
            <p className="max-w-2xl text-sm leading-7 text-slate-400">
              A multi-domain portfolio of decision-intelligence products for pricing, fraud, operations, geospatial strategy, infrastructure, and content allocation.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Navigate
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {FOOTER_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Contact
              </p>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <a href={site.links.email} className="inline-flex items-center gap-2 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45">
                  <Mail className="h-4 w-4" />
                  vaibhavb@worktechmail.com
                </a>
                <div className="flex items-center gap-4">
                  <a
                    href={site.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="text-slate-600 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={site.links.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="text-slate-600 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.04] pt-4">
          <p className="font-mono text-[10px] text-slate-600">© 2026 · Trust-framed portfolio surfaces stay route-specific.</p>
        </div>
      </div>
    </footer>
  );
}
