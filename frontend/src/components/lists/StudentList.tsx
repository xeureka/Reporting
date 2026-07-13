import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';

import type { Student } from '../../api';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';

type StudentListProps = {
  rows: Student[];
  linked?: boolean;
  emptyMessage?: string;
};

export function StudentList({ rows, linked = false, emptyMessage }: StudentListProps) {
  const columns = useMemo(
    () => [
      {
        label: 'Student',
        render: (row: Student) =>
          linked ? (
            <Link to="/students/$studentId" params={{ studentId: row.id }}>
              {row.studentName}
            </Link>
          ) : (
            row.studentName
          ),
      },
      { label: 'Level', render: (row: Student) => row.level },
      { label: 'Type', render: (row: Student) => row.classType },
      { label: 'Status', render: (row: Student) => <Badge status={row.status}>{row.status}</Badge> },
    ],
    [linked],
  );

  return <Table rows={rows} columns={columns} emptyMessage={emptyMessage} />;
}
