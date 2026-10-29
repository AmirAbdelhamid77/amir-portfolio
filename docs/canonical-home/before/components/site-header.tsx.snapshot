"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { NAV, NAV_SECTIONS, SECONDARY_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeControls } from "@/components/theme-controls";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPrototype = pathname === "/prototype-c" || pathname === "/prototype-c/" || (isHome && process.env.NEXT_PUBLIC_HANSA_PROTOTYPE_C === "1");
  const navigation = isPrototype ? [
    { href: "/prototype-c/", label: "Today", description: "Daily scenario and insight archive" },
    { href: "/learn/catalogue", label: "Learn", description: "Courses, references and labs" },
    { href: "/practice/catalogue", label: "Practice", description: "Independent practice and saved sessions" },
    { href: "/learn/dp-600/atlas/", label: "Atlas", description: "Evidence behind concept connections" },
    { href: "/about", label: "About", description: "Background and contact" },
  ] : isHome
    ? [{ href: "/learn/dp-600/atlas/", label: "Atlas", description: "Documented concept connections" }, ...NAV.filter(item => ["/learn/catalogue", "/practice/catalogue"].includes(item.href))]
    : NAV;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The menu is a dropdown, not a dialog, so it closes the way people expect a
  // dropdown to close: Escape, or a tap anywhere outside the header.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // A nav item can own a family of routes: `/learn/chapter/04/` is still Learn,
  // `/lab/dp-600/mock/` is still Practice. The mapping lives in lib/site.ts so the
  // footer and the catalogues highlight the same families.
  const isActive = (href: string) => {
    if (isPrototype && href === "/prototype-c/") return pathname.replace(/\/$/, "") === "/prototype-c" || isHome;
    const prefixes = NAV_SECTIONS[href] ?? [href];
    return prefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-lg text-sm font-semibold tracking-tight"
          >
            <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-[9px] bg-[color-mix(in_oklch,var(--primary)_78%,black)] text-[11px] font-bold tracking-tight text-primary-foreground shadow-sm">
              AA
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent"
              />
            </span>
            <span className="hidden sm:inline">
              Amir Abdelhamid
              <span className="ml-2 hidden rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] font-normal uppercase tracking-wider text-muted-foreground md:inline">
                Data
              </span>
            </span>
            <span className="sr-only"> — home</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/search/"
            aria-label="Search the site"
            className="press flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Link>
          <ThemeControls />
          {!isHome && !isPrototype && <Link
            href="/contact"
            className="press hidden h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-foreground/90 sm:inline-flex"
          >
            Discuss a project
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="press flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground lg:hidden"
          >
            {open ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-3 md:px-6">
          <ul className="grid gap-0.5">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm",
                    isActive(item.href)
                      ? "bg-card font-medium text-foreground"
                      : "text-muted-foreground hover:bg-card hover:text-foreground",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block">{item.label}</span>
                    <span className="block text-[11px] font-normal leading-5 text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li aria-hidden="true" className="my-1 border-t border-border" />
            {SECONDARY_NAV.filter(item => !(isHome || isPrototype) || item.href !== "/experience").map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground"
                >
                  {item.label}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2.5 text-sm font-medium text-background"
              >
                Discuss a project
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
