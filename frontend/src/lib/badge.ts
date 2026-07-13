export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'neutral';

export function badgeVariantFromStatus(status: string): BadgeVariant {
  const normalized = status.trim().toLowerCase();

  if (['active', 'present', 'yes', 'completed', 'online'].includes(normalized)) {
    return 'success';
  }

  if (['paused', 'late', 'pending', 'mini group', 'group'].includes(normalized)) {
    return 'warning';
  }

  if (['absent', 'cancelled', 'inactive', 'no'].includes(normalized)) {
    return 'danger';
  }

  if (['classroom', 'private'].includes(normalized)) {
    return 'neutral';
  }

  return 'default';
}
