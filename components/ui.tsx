import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 md:px-6", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  dot = false,
  className,
}: {
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {dot ? (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: string };
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-sm transition-colors hover:bg-card"
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent shadow-sm",
  contrast:
    "bg-foreground text-background hover:bg-foreground/90 border border-transparent shadow-sm",
  secondary:
    "border border-border-strong bg-background text-foreground hover:bg-card",
  ghost:
    "border border-transparent text-foreground hover:bg-card hover:border-border",
} as const;

const buttonSizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-sm",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  external = false,
  icon = false,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  external?: boolean;
  icon?: boolean;
}) {
  const classes = cn(
    "press inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );

  const content = (
    <>
      {children}
      {icon ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-3xl border border-border bg-card/60 p-6 transition-colors hover:border-border-strong",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Stat({
  value,
  label,
  note,
  className,
}: {
  value: string;
  label: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-background/60 p-4", className)}>
      <p className="font-mono text-xl font-medium tracking-tight text-foreground sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-foreground/80">{label}</p>
      {note ? (
        <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-4 [&_strong]:font-medium [&_strong]:text-foreground">
      {children}
    </div>
  );
}
