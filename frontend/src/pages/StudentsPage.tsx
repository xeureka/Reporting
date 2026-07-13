import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api } from '../api';
import { StudentList } from '../components/lists/StudentList';
import { Page } from '../components/ui/Page';
import { QueryFeedback } from '../components/ui/QueryFeedback';
import { STUDENT_STATUSES } from '../lib/constants';

export function StudentsPage() {
  const [status, setStatus] = useState('Active');
  const students = useQuery({
    queryKey: ['students', status],
    queryFn: () => api.students({ status }),
    retry: false,
  });

  return (
    <Page title="Students" subtitle="Filtered student views by enrollment status.">
      <div className="toolbar" role="tablist" aria-label="Student status filter">
        {STUDENT_STATUSES.map((option) => (
          <button
            className={status === option ? 'active' : ''}
            key={option}
            type="button"
            onClick={() => setStatus(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <QueryFeedback
        isLoading={students.isLoading}
        isError={students.isError}
        error={students.error}
        isEmpty={(students.data?.length ?? 0) === 0}
        emptyMessage={`No ${status.toLowerCase()} students found.`}
      >
        <StudentList rows={students.data ?? []} linked />
      </QueryFeedback>
    </Page>
  );
}
