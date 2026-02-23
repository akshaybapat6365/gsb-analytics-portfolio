"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: site.links.email },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgba(10,10,14,0.88)] backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1420px] items-center justify-between px-4 py-3.5 sm:px-7 lg:px-10">
        <Link
          href="/"
          className="group flex items-baseline gap-3 no-underline hover:no-underline"
        >
          <span className="font-display text-[1.04rem] font-semibold tracking-tight text-slate-50">
            {site.name}
          </span>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] text-slate-300 md:inline">
            {site.role}
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-4">
          {NAV_ITEMS.map((item) => {
            const external = item.href.startsWith("mailto:");
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : external
                  ? false
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hideOnMobile = item.label === "Resume" || item.label === "Contact";
            const className = cn(
              "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition sm:text-xs sm:tracking-[0.15em]",
              hideOnMobile && "hidden sm:inline-flex",
              isActive
                ? "border-white/25 bg-white/[0.08] text-white"
                : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15] hover:text-white",
            );

            if (external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={className}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={className}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="hidden h-6 w-px bg-white/10 sm:block" />

          <div className="hidden items-center gap-1 text-slate-300 sm:flex sm:gap-2">
            <a
              href={site.links.linkedin}
              aria-label="LinkedIn"
              title="LinkedIn"
              className="rounded-md p-2 hover:bg-white/[0.08] hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={site.links.github}
              aria-label="GitHub"
              title="GitHub"
              className="rounded-md p-2 hover:bg-white/[0.08] hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={site.links.email}
              aria-label="Email"
              title="Email"
              className="rounded-md p-2 hover:bg-white/[0.08] hover:text-white"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
