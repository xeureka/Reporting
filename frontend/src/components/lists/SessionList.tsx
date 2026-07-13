import type { Session } from '../../api';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';

export function SessionList({ rows, emptyMessage }: { rows: Session[]; emptyMessage?: string }) {
  return (
    <Table
      rows={rows}
      emptyMessage={emptyMessage}
      columns={[
        { label: 'Session', render: (row) => row.sessionName },
        { label: 'Date', render: (row) => row.sessionDate },
        { label: 'Lesson', render: (row) => `${row.lessonNumber}. ${row.lessonTitle}` },
        { label: 'Attendance', render: (row) => <Badge status={row.attendance}>{row.attendance}</Badge> },
      ]}
    />
  );
}
