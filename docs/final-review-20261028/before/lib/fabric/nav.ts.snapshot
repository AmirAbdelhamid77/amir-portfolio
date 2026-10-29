// Route map for the DP-600 hub, shared by the sub-navigation, the resume links
// and the progress page so a mode never points at a stale URL.

import type { FabricMode } from "./engine";

export const MODE_PATH: Record<FabricMode, string> = {
  guided: "/lab/dp-600/study/",
  topic: "/lab/dp-600/practice/",
  mock: "/lab/dp-600/mock/",
  case: "/lab/dp-600/cases/",
  review: "/lab/dp-600/review/",
};

export const MODE_LABEL: Record<FabricMode, string> = {
  guided: "Guided study",
  topic: "Topic practice",
  mock: "Mock exam",
  case: "Case-study practice",
  review: "Mistake review",
};

export const HUB_NAV = [
  { href: "/learn/dp-600/", label: "Learning academy" },
  { href: "/lab/dp-600/", label: "Overview" },
  { href: "/lab/dp-600/explore/", label: "Explore the bank" },
  { href: "/lab/dp-600/study/", label: "Guided study" },
  { href: "/lab/dp-600/practice/", label: "Topic practice" },
  { href: "/lab/dp-600/mock/", label: "Mock exam" },
  { href: "/lab/dp-600/cases/", label: "Case studies" },
  { href: "/lab/dp-600/review/", label: "Mistakes & bookmarks" },
  { href: "/lab/dp-600/progress/", label: "Progress" },
  { href: "/lab/dp-600/resources/", label: "Resources" },
] as const;

export function sessionHref(mode: FabricMode, sessionId: string) {
  return `${MODE_PATH[mode]}?session=${encodeURIComponent(sessionId)}`;
}
