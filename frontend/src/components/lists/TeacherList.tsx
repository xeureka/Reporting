import type { Teacher } from '../../api';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';

export function TeacherList({ rows, emptyMessage }: { rows: Teacher[]; emptyMessage?: string }) {
  return (
    <Table
      rows={rows}
      emptyMessage={emptyMessage}
      columns={[
        { label: 'Teacher', render: (row) => row.teacherName },
        { label: 'Email', render: (row) => row.email },
        { label: 'Status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
      ]}
    />
  );
}
