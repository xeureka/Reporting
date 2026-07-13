import type { Course } from '../../api';
import { Table } from '../ui/Table';

export function CourseList({ rows, emptyMessage }: { rows: Course[]; emptyMessage?: string }) {
  return (
    <Table
      rows={rows}
      emptyMessage={emptyMessage}
      columns={[
        { label: 'Course', render: (row) => row.courseName },
        { label: 'Level', render: (row) => row.level },
        { label: 'Units', render: (row) => row.totalUnits },
        { label: 'Lessons', render: (row) => row.totalLessons },
      ]}
    />
  );
}
