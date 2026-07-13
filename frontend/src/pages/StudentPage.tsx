import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

import { api } from '../api';
import { AssignmentList } from '../components/lists/AssignmentList';
import { HomeworkList } from '../components/lists/HomeworkList';
import { SessionList } from '../components/lists/SessionList';
import { ChangePasswordForm } from '../components/forms/ChangePasswordForm';
import { Panel } from '../components/ui/Panel';
import { Page } from '../components/ui/Page';
import { QueryFeedback } from '../components/ui/QueryFeedback';

export function StudentPage() {
  const { studentId } = useParams({ from: '/protected/students/$studentId' });

  const data = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => api.studentPage(studentId),
    retry: false,
  });

  const assignments = useQuery({
    queryKey: ['assignments', 'student', studentId],
    queryFn: () => api.assignments({ studentId }),
    retry: false,
  });

  const sessions = useQuery({
    queryKey: ['sessions', 'student', studentId],
    queryFn: () => api.sessions({ studentId }),
    retry: false,
  });

  const homework = useQuery({
    queryKey: ['homework', 'student', studentId],
    queryFn: () => api.homework({ studentId }),
    retry: false,
  });

  const studentInfo = data.data?.student;

  return (
    <Page
      title={studentInfo?.studentName ?? 'Student'}
      subtitle={`Level: ${studentInfo?.level ?? '...'}`}
    >
      <QueryFeedback
        isLoading={data.isLoading}
        isError={data.isError}
        error={data.error}
        isEmpty={!data.data}
        emptyMessage="Student profile could not be loaded."
      >
        {data.data && (
          <>
            <div className="dashboard-grid">
              <Panel title="My Teacher">
                <div className="info-block">
                  <p>{data.data.teacher?.teacherName ?? 'No teacher assigned.'}</p>
                  {data.data.teacher?.email && <small>{data.data.teacher.email}</small>}
                </div>
              </Panel>

              <Panel title="My Schedule">
                <QueryFeedback
                  isLoading={assignments.isLoading}
                  isError={assignments.isError}
                  error={assignments.error}
                  isEmpty={(assignments.data?.length ?? 0) === 0}
                  emptyMessage="No assignments found."
                  skeletonHeight={160}
                >
                  <AssignmentList rows={assignments.data ?? []} />
                </QueryFeedback>
              </Panel>
            </div>

            <div className="dashboard-grid page-section">
              <Panel title="Lesson History">
                <QueryFeedback
                  isLoading={sessions.isLoading}
                  isError={sessions.isError}
                  error={sessions.error}
                  isEmpty={(sessions.data?.length ?? 0) === 0}
                  emptyMessage="No lesson history yet."
                  skeletonHeight={160}
                >
                  <SessionList rows={sessions.data ?? []} />
                </QueryFeedback>
              </Panel>

              <Panel title="Homework">
                <QueryFeedback
                  isLoading={homework.isLoading}
                  isError={homework.isError}
                  error={homework.error}
                  isEmpty={(homework.data?.length ?? 0) === 0}
                  emptyMessage="No homework assigned."
                  skeletonHeight={160}
                >
                  <HomeworkList rows={homework.data ?? []} />
                </QueryFeedback>
              </Panel>
            </div>

            <div className="page-section">
              <ChangePasswordForm />
            </div>
          </>
        )}
      </QueryFeedback>
    </Page>
  );
}
