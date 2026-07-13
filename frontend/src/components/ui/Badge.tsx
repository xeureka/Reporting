import type { ReactNode } from 'react';

import { badgeVariantFromStatus, type BadgeVariant } from '../../lib/badge';

type BadgeProps = {
  children: ReactNode;
  status?: string;
  variant?: BadgeVariant;
};

export function Badge({ children, status, variant }: BadgeProps) {
  const resolvedVariant = variant ?? (status ? badgeVariantFromStatus(status) : 'default');

  return <span className={`badge badge-${resolvedVariant}`}>{children}</span>;
}
