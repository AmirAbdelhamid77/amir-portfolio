import type { Metadata } from "next";
import { ArrowLeft, Compass } from "lucide-react";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      <div aria-hidden="true" className="grid-noise mask-radial-fade absolute inset-0 opacity-60" />
      <Container className="relative py-20 text-center">
        <Eyebrow>404</Eyebrow>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-medium tracking-tight md:text-5xl">
          The query returned no rows.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
          This page does not exist, or it moved when the site was rebuilt. The
          work and the Data Lab are still where you left them.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/" icon>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back home
          </ButtonLink>
          <ButtonLink href="/work" variant="secondary">
            Case studies
          </ButtonLink>
          <ButtonLink href="/lab" variant="ghost">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Data Lab
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
