import { Breadcrumbs } from "@/components/breadcrumbs";
import { resolveRouteContext, routeCrumbs } from "@/lib/navigation/route-context";

/**
 * A structural breadcrumb derived from the declared route context. It always
 * starts at a primary-nav destination (Learn or Practice), then the subject,
 * then the declared parent. Use it on pages that own their breadcrumb, such as
 * the SQL shell; pages without one get the orientation strip instead.
 */
export function RouteBreadcrumbs({
  pathname,
  current,
  className,
}: {
  pathname: string;
  current: string;
  className?: string;
}) {
  const context = resolveRouteContext(pathname);
  if (!context) return null;
  return <Breadcrumbs items={routeCrumbs(context, current)} className={className} />;
}
