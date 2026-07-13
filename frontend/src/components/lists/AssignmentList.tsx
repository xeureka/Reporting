import type { Assignment } from '../../api';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';

export function AssignmentList({ rows, emptyMessage }: { rows: Assignment[]; emptyMessage?: string }) {
  return (
    <Table
      rows={rows}
      emptyMessage={emptyMessage}
      columns={[
        { label: 'Assignment', render: (row) => row.assignmentName },
        { label: 'Days', render: (row) => row.days },
        { label: 'Time', render: (row) => row.startTime },
        { label: 'Mode', render: (row) => row.mode },
        { label: 'Status', render: (row) => <Badge status={row.status}>{row.status}</Badge> },
      ]}
    />
  );
}
