import type { Metadata } from "next";
import { SubjectHome } from "@/components/learn/subject-home";
import { requireSubject } from "@/lib/curriculum/model";

export const metadata: Metadata = {
  title: "Microsoft Fabric — learning path",
  description:
    "Build, query and govern an analytical data platform: nine topics from OneLake and ingestion to semantic models, security and real-time intelligence.",
  alternates: { canonical: "/learn/fabric/" },
};

export default function Page() {
  return <SubjectHome subject={requireSubject("fabric")} />;
}
