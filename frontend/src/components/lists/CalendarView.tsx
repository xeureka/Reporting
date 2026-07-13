import type { Session } from '../../api';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export function CalendarView({ rows }: { rows: Session[] }) {
  if (rows.length === 0) {
    return <EmptyState message="No sessions scheduled for this view." />;
  }

  return (
    <div className="calendar-grid">
      {rows.map((row) => (
        <article key={row.id} className="calendar-item">
          <strong>{row.sessionDate}</strong>
          <span>{row.lessonTitle}</span>
          <Badge status={row.attendance}>{row.attendance}</Badge>
        </article>
      ))}
    </div>
  );
}
