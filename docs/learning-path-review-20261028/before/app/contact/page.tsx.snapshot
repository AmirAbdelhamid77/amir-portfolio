import type { Metadata } from "next";
import {
  ArrowUpRight,
  CalendarClock,
  Mail,
  MapPin,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { ContactForm } from "@/components/contact-form";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Amir Abdelhamid about data analyst roles, Power BI dashboards, analysis projects, or data-lab training.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    external: false,
  },
  {
    icon: LinkedinIcon,
    label: "LinkedIn",
    value: "amir-abdelhamid",
    href: SITE.socials.linkedin,
    external: true,
  },
  {
    icon: GithubIcon,
    label: "GitHub",
    value: "AmirAbdelhamid77",
    href: SITE.socials.github,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative border-b border-border">
        <div aria-hidden="true" className="grid-noise mask-b-fade absolute inset-0 opacity-50" />
        <Container className="relative py-16 md:py-20">
          <Eyebrow dot>
            <span className="sm:hidden">Open to roles &amp; freelance</span>
            <span className="hidden sm:inline">{SITE.availability}</span>
          </Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
            Tell me the decision.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            The useful first message is short: the question, the data you have,
            and who is waiting on the answer. I will reply with an honest scope —
            including &ldquo;a dashboard is not the right answer&rdquo; when
            that is true.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <ContactForm />

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card/40 p-6">
              <Eyebrow>Direct</Eyebrow>
              <ul className="mt-4 grid gap-2">
                {CHANNELS.map((channel) => (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      target={channel.external ? "_blank" : undefined}
                      rel={channel.external ? "noreferrer noopener" : undefined}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3 transition-colors hover:border-border-strong"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <channel.icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {channel.label}
                        </span>
                        <span className="block truncate text-xs text-foreground">
                          {channel.value}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                      {channel.external ? (
                        <span className="sr-only"> (opens in a new tab)</span>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card/40 p-6">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-sm font-medium">Response time</h2>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                Usually within one working day. If you are hiring, say so in the
                subject — those messages get read first.
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {SITE.location}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/40 p-6">
              <Eyebrow>Helpful to include</Eyebrow>
              <ul className="mt-4 grid gap-2 text-xs leading-6 text-muted-foreground">
                {[
                  "The decision this work should support.",
                  "What data exists today, and where it lives.",
                  "Any deadline or audience you already have.",
                  "For roles: the title, location, and time zone.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card/40 p-6">
              <Eyebrow>Not sure yet?</Eyebrow>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                Try the Data Lab first. It is free, needs no account, and shows
                the kind of reasoning I care about.
              </p>
              <ButtonLink href="/lab" variant="secondary" size="sm" className="mt-3" icon>
                Open the Data Lab
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
