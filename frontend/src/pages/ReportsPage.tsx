import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api, type Session } from '../api';
import { StudentList } from '../components/lists/StudentList';
import { TeacherList } from '../components/lists/TeacherList';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Page } from '../components/ui/Page';
import { Panel } from '../components/ui/Panel';
import { QueryFeedback } from '../components/ui/QueryFeedback';
import { Table } from '../components/ui/Table';

export function ReportsPage() {
  const dashboard = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: api.adminDashboard,
    retry: false,
  });
  const reports = dashboard.data?.reports;

  const allSessions = useQuery({
    queryKey: ['sessions', 'all'],
    queryFn: () => api.sessions(),
    retry: false,
  });
  const teachers = useQuery({
    queryKey: ['teachers', 'all'],
    queryFn: () => api.teachers(),
    retry: false,
  });
  const students = useQuery({
    queryKey: ['students', 'all'],
    queryFn: () => api.students(),
    retry: false,
  });

  const teacherMap = useMemo(
    () => new Map((teachers.data ?? []).map((teacher) => [teacher.id, teacher.teacherName])),
    [teachers.data],
  );
  const studentMap = useMemo(
    () => new Map((students.data ?? []).map((student) => [student.id, student.studentName])),
    [students.data],
  );

  const recentSessions = useMemo(
    () => (allSessions.data ?? []).slice().sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)),
    [allSessions.data],
  );

  const sessionColumns = useMemo(
    () => [
      { label: 'Date', render: (row: Session) => row.sessionDate },
      { label: 'Teacher', render: (row: Session) => teacherMap.get(row.teacherId) ?? row.teacherId },
      { label: 'Student', render: (row: Session) => studentMap.get(row.studentId) ?? row.studentId },
      { label: 'Lesson', render: (row: Session) => row.lessonTitle },
      { label: 'Attendance', render: (row: Session) => <Badge>{row.attendance}</Badge> },
      { label: 'Notes', render: (row: Session) => row.teacherNotes || '-' },
      {
        label: 'Homework',
        render: (row: Session) =>
          row.homeworkSubmitted ? <Badge>Yes</Badge> : <Badge>No</Badge>,
      },
    ],
    [teacherMap, studentMap],
  );

  return (
    <Page
      title="Reports"
      subtitle="Computed views for attendance risk, missing reports, schedule drift, and active accounts."
    >
      <QueryFeedback
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        error={dashboard.error}
        isEmpty={!reports}
        emptyMessage="Report data is not available."
      >
        {reports && (
          <>
            <div className="dashboard-grid">
              <Panel title="Students with Low Attendance">
                {reports.studentsWithLowAttendance.length > 0 ? (
                  <StudentList rows={reports.studentsWithLowAttendance} />
                ) : (
                  <EmptyState message="None." description="All students are above the attendance threshold." />
                )}
              </Panel>
              <Panel title="Teachers with Missing Lesson Reports">
                {reports.teachersMissingLessonReports.length > 0 ? (
                  <TeacherList rows={reports.teachersMissingLessonReports} />
                ) : (
                  <EmptyState message="None." description="All teachers have submitted recent reports." />
                )}
              </Panel>
              <Panel title="Students Behind Schedule">
                {reports.studentsBehindSchedule.length > 0 ? (
                  <StudentList rows={reports.studentsBehindSchedule} />
                ) : (
                  <EmptyState message="None." description="All students are on track." />
                )}
              </Panel>
            </div>

            <div className="dashboard-grid page-section">
              <Panel title="Submitted Session Reports">
                {recentSessions.length > 0 ? (
                  <Table rows={recentSessions} columns={sessionColumns} />
                ) : (
                  <EmptyState message="None." description="No session reports have been submitted yet." />
                )}
              </Panel>
            </div>
          </>
        )}
      </QueryFeedback>
    </Page>
  );
}
