import type { ReactNode } from 'react';

/**
 * Avoid static path generation / RSC analysis issues for this dynamic admin route.
 */
export const dynamic = 'force-dynamic';

export default function AdminUserReportLayout({ children }: { children: ReactNode }) {
  return children;
}
