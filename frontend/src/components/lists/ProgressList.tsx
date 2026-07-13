import type { Progress } from '../../api';
import { Table } from '../ui/Table';

export function ProgressList({ rows, emptyMessage }: { rows: Progress[]; emptyMessage?: string }) {
  return (
    <Table
      rows={rows}
      emptyMessage={emptyMessage}
      columns={[
        { label: 'Student', render: (row) => row.studentId },
        { label: 'Unit', render: (row) => row.currentUnit },
        { label: 'Lesson', render: (row) => row.currentLesson },
        { label: 'Complete', render: (row) => `${row.completionPercentage}%` },
      ]}
    />
  );
}
