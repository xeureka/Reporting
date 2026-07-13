import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api';
import { useAuth } from '../auth';
import { AssignmentList } from '../components/lists/AssignmentList';
import { StudentList } from '../components/lists/StudentList';
import { ChangePasswordForm } from '../components/forms/ChangePasswordForm';
import { Panel } from '../components/ui/Panel';
import { Page } from '../components/ui/Page';
import { QueryFeedback } from '../components/ui/QueryFeedback';
import { StatusMessage } from '../components/ui/StatusMessage';
import { ATTENDANCE_OPTIONS } from '../lib/constants';

export function TeacherDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const teacherId = user?.teacherId ?? '';

  const assignments = useQuery({
    queryKey: ['assignments', teacherId],
    queryFn: () => api.assignments({ teacherId, status: 'Active' }),
    retry: false,
  });

  const allStudents = useQuery({
    queryKey: ['students', 'Active'],
    queryFn: () => api.students({ status: 'Active' }),
    retry: false,
  });

  const myStudents = useMemo(
    () => (allStudents.data ?? []).filter((student) => student.assignedTeacherId === teacherId),
    [allStudents.data, teacherId],
  );

  const [reportAssignmentId, setReportAssignmentId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportLessonTitle, setReportLessonTitle] = useState('');
  const [reportAttendance, setReportAttendance] = useState('Present');
  const [reportNotes, setReportNotes] = useState('');
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [reportError, setReportError] = useState(false);

  const createSession = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.createSession(body),
    onSuccess: () => {
      setReportMsg('Session report submitted.');
      setReportError(false);
      setReportLessonTitle('');
      setReportNotes('');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      setReportMsg(err instanceof Error ? err.message : 'Failed to submit session.');
      setReportError(true);
    },
  });

  return (
    <Page title="Teacher Dashboard" subtitle={`Welcome, ${user?.name ?? 'Teacher'}.`}>
      <div className="dashboard-grid">
        <Panel title="My Schedule">
          <QueryFeedback
            isLoading={assignments.isLoading}
            isError={assignments.isError}
            error={assignments.error}
            isEmpty={(assignments.data?.length ?? 0) === 0}
            emptyMessage="No active assignments yet."
            skeletonHeight={180}
          >
            <AssignmentList rows={assignments.data ?? []} />
          </QueryFeedback>
        </Panel>

        <Panel title="My Students">
          <QueryFeedback
            isLoading={allStudents.isLoading}
            isError={allStudents.isError}
            error={allStudents.error}
            isEmpty={myStudents.length === 0}
            emptyMessage="No students assigned."
            skeletonHeight={180}
          >
            <StudentList rows={myStudents} linked />
          </QueryFeedback>
        </Panel>
      </div>

      <div className="dashboard-grid page-section">
        <Panel title="Submit Session Report">
          {reportMsg && (
            <StatusMessage variant={reportError ? 'error' : 'success'}>{reportMsg}</StatusMessage>
          )}
          <form
            className="inline-form"
            onSubmit={(event) => {
              event.preventDefault();
              const selected = assignments.data?.find((assignment) => assignment.id === reportAssignmentId);
              if (!selected) return;

              createSession.mutate({
                sessionName: `${selected.assignmentName} - ${reportLessonTitle || 'Lesson'}`,
                sessionDate: reportDate,
                teacherId,
                studentId: selected.studentId,
                assignmentId: reportAssignmentId,
                lessonNumber: 1,
                lessonTitle: reportLessonTitle,
                attendance: reportAttendance,
                present: reportAttendance === 'Present',
                absent: reportAttendance === 'Absent',
                late: reportAttendance === 'Late',
                cancelled: reportAttendance === 'Cancelled',
                durationMinutes: 60,
                teacherNotes: reportNotes,
                homeworkSubmitted: false,
              });
            }}
          >
            <label className="form-field">
              <span>Assignment</span>
              <select
                value={reportAssignmentId}
                onChange={(event) => setReportAssignmentId(event.target.value)}
                required
              >
                <option value="">Select assignment</option>
                {assignments.data?.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.assignmentName}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Date</span>
              <input
                value={reportDate}
                onChange={(event) => setReportDate(event.target.value)}
                type="date"
                required
              />
            </label>
            <label className="form-field">
              <span>Lesson title</span>
              <input
                value={reportLessonTitle}
                onChange={(event) => setReportLessonTitle(event.target.value)}
                placeholder="Lesson title"
                required
              />
            </label>
            <label className="form-field">
              <span>Attendance</span>
              <select
                value={reportAttendance}
                onChange={(event) => setReportAttendance(event.target.value)}
              >
                {ATTENDANCE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="form-field form-field-wide">
              <span>Notes (optional)</span>
              <textarea
                value={reportNotes}
                onChange={(event) => setReportNotes(event.target.value)}
                placeholder="Notes (optional)"
                rows={4}
              />
            </label>
            <button
              type="submit"
              className="btn-primary"
              disabled={createSession.isPending || !reportAssignmentId}
            >
              {createSession.isPending ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </Panel>

        <ChangePasswordForm />
      </div>
    </Page>
  );
}
