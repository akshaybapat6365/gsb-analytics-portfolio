import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { site } from "@/lib/site";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#04060dcc]/80 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1420px] items-center justify-between px-5 py-4 sm:px-7 lg:px-10">
        <Link
          href="/"
          className="group flex items-baseline gap-3 no-underline hover:no-underline"
        >
          <span className="font-display text-[1.03rem] font-semibold tracking-tight text-slate-100">
            {site.name}
          </span>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-slate-400 md:inline">
            {site.role}
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/projects"
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-200/90 hover:border-cyan-300/30 hover:text-cyan-100"
          >
            Projects
          </Link>
          <a
            href={site.links.resume}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-200/90 hover:border-cyan-300/30 hover:text-cyan-100"
          >
            Resume
          </a>

          <div className="hidden h-6 w-px bg-white/10 sm:block" />

          <div className="flex items-center gap-1 text-slate-300 sm:gap-2">
            <a
              href={site.links.linkedin}
              aria-label="LinkedIn"
              className="rounded-md p-1.5 hover:bg-white/[0.08] hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={site.links.github}
              aria-label="GitHub"
              className="rounded-md p-1.5 hover:bg-white/[0.08] hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={site.links.email}
              aria-label="Email"
              className="rounded-md p-1.5 hover:bg-white/[0.08] hover:text-white"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
