import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api';
import { AssignmentList } from '../components/lists/AssignmentList';
import { Page } from '../components/ui/Page';
import { QueryFeedback } from '../components/ui/QueryFeedback';
import { ASSIGNMENT_MODES } from '../lib/constants';

export function AssignmentsPage() {
  const queryClient = useQueryClient();
  const assignments = useQuery({
    queryKey: ['assignments'],
    queryFn: () => api.assignments({ status: 'Active' }),
    retry: false,
  });
  const teachers = useQuery({ queryKey: ['teachers'], queryFn: () => api.teachers(), retry: false });
  const students = useQuery({ queryKey: ['students'], queryFn: () => api.students(), retry: false });
  const courses = useQuery({ queryKey: ['courses'], queryFn: api.courses, retry: false });

  const [showForm, setShowForm] = useState(false);
  const [fields, setFields] = useState({
    assignmentName: '',
    teacherId: '',
    studentId: '',
    courseId: '',
    days: 'Mon,Wed,Fri',
    startTime: '09:00',
    startDate: new Date().toISOString().slice(0, 10),
    mode: 'Online',
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.createAssignment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setShowForm(false);
    },
  });

  return (
    <Page title="Class Assignments" subtitle="Active classes, grouped by teacher and student.">
      <div className="toolbar">
        <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Assignment'}
        </button>
      </div>

      {showForm && (
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate(fields);
          }}
        >
          <label className="form-field">
            <span>Assignment name</span>
            <input
              value={fields.assignmentName}
              onChange={(event) => setFields({ ...fields, assignmentName: event.target.value })}
              placeholder="Assignment name"
              required
            />
          </label>
          <label className="form-field">
            <span>Teacher</span>
            <select
              value={fields.teacherId}
              onChange={(event) => setFields({ ...fields, teacherId: event.target.value })}
              required
            >
              <option value="">Select teacher</option>
              {teachers.data?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.teacherName}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Student</span>
            <select
              value={fields.studentId}
              onChange={(event) => setFields({ ...fields, studentId: event.target.value })}
              required
            >
              <option value="">Select student</option>
              {students.data?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.studentName}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Course</span>
            <select
              value={fields.courseId}
              onChange={(event) => setFields({ ...fields, courseId: event.target.value })}
              required
            >
              <option value="">Select course</option>
              {courses.data?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Mode</span>
            <select
              value={fields.mode}
              onChange={(event) => setFields({ ...fields, mode: event.target.value })}
              required
            >
              {ASSIGNMENT_MODES.map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Days</span>
            <input
              value={fields.days}
              onChange={(event) => setFields({ ...fields, days: event.target.value })}
              placeholder="Days (Mon,Wed,Fri)"
              required
            />
          </label>
          <label className="form-field">
            <span>Start time</span>
            <input
              value={fields.startTime}
              onChange={(event) => setFields({ ...fields, startTime: event.target.value })}
              type="time"
              required
            />
          </label>
          <label className="form-field">
            <span>Start date</span>
            <input
              value={fields.startDate}
              onChange={(event) => setFields({ ...fields, startDate: event.target.value })}
              type="date"
              required
            />
          </label>
          <button
            type="submit"
            className="btn-primary"
            disabled={
              create.isPending || !fields.teacherId || !fields.studentId || !fields.courseId
            }
          >
            {create.isPending ? 'Saving...' : 'Save Assignment'}
          </button>
        </form>
      )}

      <QueryFeedback
        isLoading={assignments.isLoading}
        isError={assignments.isError}
        error={assignments.error}
        isEmpty={(assignments.data?.length ?? 0) === 0}
        emptyMessage="No active assignments."
      >
        <AssignmentList rows={assignments.data ?? []} />
      </QueryFeedback>
    </Page>
  );
}
