import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { FOOTER_LINKS, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-primary text-[11px] font-bold text-primary-foreground">
              AA
            </span>
            {SITE.name}
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {SITE.shortDescription} Based in {SITE.location}.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href={`mailto:${SITE.email}`}
              className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              Email
            </a>
            <a
              href={SITE.socials.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
            >
              <LinkedinIcon className="h-3.5 w-3.5" aria-hidden="true" />
              LinkedIn
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={SITE.socials.github}
              target="_blank"
              rel="noreferrer noopener"
              className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
            >
              <GithubIcon className="h-3.5 w-3.5" aria-hidden="true" />
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>

        {FOOTER_LINKS.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {group.heading}
            </h2>
            <ul className="mt-3 grid gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Open to data roles and freelance projects
          </p>
        </div>
      </div>
    </footer>
  );
}
