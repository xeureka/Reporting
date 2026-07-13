import type { Homework } from '../../api';
import { Table } from '../ui/Table';

export function HomeworkList({ rows, emptyMessage }: { rows: Homework[]; emptyMessage?: string }) {
  return (
    <Table
      rows={rows}
      emptyMessage={emptyMessage}
      columns={[
        { label: 'Homework', render: (row) => row.homework },
        { label: 'Due', render: (row) => row.dueDate },
        { label: 'Submitted', render: (row) => (row.submitted ? 'Yes' : 'No') },
        { label: 'Score', render: (row) => row.score ?? '-' },
      ]}
    />
  );
}
