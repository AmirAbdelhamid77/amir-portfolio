import type { Metadata } from "next";
import { GlossarySearch } from "@/components/statistics/glossary-search";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Bilingual statistics glossary",
  description:
    "English statistical terms with Arabic explanations, linked to the source section and the interactive lab. Search in English or Arabic, including اختبار الفرضيات and فترة الثقة.",
  alternates: { canonical: "/learn/statistics/glossary" },
};

export default function GlossaryPage() {
  return (
    <>
      <StatisticsPageHeader
        eyebrow="Glossary"
        current="glossary"
        title="The vocabulary, in two languages"
        description="Technical terms stay in English; the Arabic explanation is preserved. Search works across both, so a reader can start from “فترة الثقة” or “confidence interval” and land on the same idea."
        actions={
          <>
            <ButtonLink href="/learn/statistics/journey/foundations" variant="contrast" icon>
              Read the foundations
            </ButtonLink>
            <ButtonLink href="/learn/statistics/formulas" variant="secondary">
              Formula workbench
            </ButtonLink>
          </>
        }
      />
      <Container className="py-8 md:py-10">
        <GlossarySearch />
        <p className="mt-6 rounded-2xl border border-border bg-card/30 p-4 text-[11px] leading-5 text-muted-foreground">
          A definition is a starting point, not a substitute for the lesson. Every entry links to the source section
          where the concept is explained in context, and to a lab when one exists. Arabic terms are explanatory, not a
          transliteration of the notation.
        </p>
      </Container>
    </>
  );
}
