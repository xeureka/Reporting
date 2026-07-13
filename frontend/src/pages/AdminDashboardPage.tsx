import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api';
import { DashboardGrid } from '../components/lists/DashboardGrid';
import { Panel } from '../components/ui/Panel';
import { Page } from '../components/ui/Page';
import { QueryFeedback } from '../components/ui/QueryFeedback';
import { StatusMessage } from '../components/ui/StatusMessage';
import { ASSIGNMENT_MODES, CLASS_TYPES, LEVELS } from '../lib/constants';

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const dashboard = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: api.adminDashboard, retry: false });

  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherMsg, setTeacherMsg] = useState<string | null>(null);
  const [teacherError, setTeacherError] = useState(false);

  const registerTeacher = useMutation({
    mutationFn: async () => {
      const res = await api.createTeacher({ teacherName, email: teacherEmail });
      return (res as unknown as { password: string }).password;
    },
    onSuccess: (password) => {
      setTeacherMsg(`Teacher created. Password: ${password}`);
      setTeacherError(false);
      setTeacherName('');
      setTeacherEmail('');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      setTeacherMsg(err instanceof Error ? err.message : 'Failed to create teacher.');
      setTeacherError(true);
    },
  });

  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentLevel, setStudentLevel] = useState('Beginner');
  const [studentClassType, setStudentClassType] = useState('Private');
  const [studentMsg, setStudentMsg] = useState<string | null>(null);
  const [studentError, setStudentError] = useState(false);

  const registerStudent = useMutation({
    mutationFn: async () => {
      const res = await api.createStudent({
        studentName,
        email: studentEmail,
        level: studentLevel,
        classType: studentClassType,
      });
      return (res as unknown as { password: string }).password;
    },
    onSuccess: (password) => {
      setStudentMsg(`Student created. Password: ${password}`);
      setStudentError(false);
      setStudentName('');
      setStudentEmail('');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      setStudentMsg(err instanceof Error ? err.message : 'Failed to create student.');
      setStudentError(true);
    },
  });

  const teachers = useQuery({ queryKey: ['teachers'], queryFn: () => api.teachers(), retry: false });
  const students = useQuery({
    queryKey: ['students', 'Active'],
    queryFn: () => api.students({ status: 'Active' }),
    retry: false,
  });
  const courses = useQuery({ queryKey: ['courses'], queryFn: api.courses, retry: false });

  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignCourseId, setAssignCourseId] = useState('');
  const [planType, setPlanType] = useState('Private');
  const [assignMsg, setAssignMsg] = useState<string | null>(null);
  const [assignError, setAssignError] = useState(false);

  const createAssignment = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.createAssignment(body),
    onSuccess: () => {
      setAssignMsg('Assignment created successfully.');
      setAssignError(false);
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      setAssignMsg(err instanceof Error ? err.message : 'Failed to create assignment.');
      setAssignError(true);
    },
  });

  return (
    <Page
      title="Admin Dashboard"
      subtitle="Manage teachers, students, assignments, and view operational data."
    >
      <QueryFeedback
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        error={dashboard.error}
        isEmpty={!dashboard.data}
        emptyMessage="Dashboard data is not available right now."
      >
        {dashboard.data && (
          <>
            <DashboardGrid data={dashboard.data} />

            <div className="dashboard-grid page-section">
              <Panel title="Register New Teacher">
                {teacherMsg && (
                  <StatusMessage variant={teacherError ? 'error' : 'success'}>{teacherMsg}</StatusMessage>
                )}
                <form
                  className="inline-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    registerTeacher.mutate();
                  }}
                >
                  <label className="form-field">
                    <span>Teacher name</span>
                    <input
                      value={teacherName}
                      onChange={(event) => setTeacherName(event.target.value)}
                      placeholder="Teacher name"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Email</span>
                    <input
                      value={teacherEmail}
                      onChange={(event) => setTeacherEmail(event.target.value)}
                      type="email"
                      placeholder="Email"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={registerTeacher.isPending || !teacherName || !teacherEmail}
                  >
                    {registerTeacher.isPending ? 'Creating...' : 'Create Teacher'}
                  </button>
                </form>
              </Panel>

              <Panel title="Register New Student">
                {studentMsg && (
                  <StatusMessage variant={studentError ? 'error' : 'success'}>{studentMsg}</StatusMessage>
                )}
                <form
                  className="inline-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    registerStudent.mutate();
                  }}
                >
                  <label className="form-field">
                    <span>Student name</span>
                    <input
                      value={studentName}
                      onChange={(event) => setStudentName(event.target.value)}
                      placeholder="Student name"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Email</span>
                    <input
                      value={studentEmail}
                      onChange={(event) => setStudentEmail(event.target.value)}
                      type="email"
                      placeholder="Email"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Level</span>
                    <select value={studentLevel} onChange={(event) => setStudentLevel(event.target.value)}>
                      {LEVELS.map((level) => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Class type</span>
                    <select
                      value={studentClassType}
                      onChange={(event) => setStudentClassType(event.target.value)}
                    >
                      {CLASS_TYPES.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={registerStudent.isPending || !studentName || !studentEmail}
                  >
                    {registerStudent.isPending ? 'Creating...' : 'Create Student'}
                  </button>
                </form>
              </Panel>
            </div>

            <Panel title="Assign Student to Teacher" className="page-section">
              {assignMsg && (
                <StatusMessage variant={assignError ? 'error' : 'success'}>{assignMsg}</StatusMessage>
              )}
              <form
                className="inline-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!assignTeacherId || !assignStudentId || !assignCourseId) return;

                  const teacherName =
                    teachers.data?.find((teacher) => teacher.id === assignTeacherId)?.teacherName ?? '';
                  const studentName =
                    students.data?.find((student) => student.id === assignStudentId)?.studentName ?? '';

                  createAssignment.mutate({
                    assignmentName: `${planType} - ${teacherName} / ${studentName}`,
                    teacherId: assignTeacherId,
                    studentId: assignStudentId,
                    courseId: assignCourseId,
                    days: 'Mon,Wed,Fri',
                    startTime: '09:00',
                    startDate: new Date().toISOString().slice(0, 10),
                    mode: planType,
                  });
                }}
              >
                <label className="form-field">
                  <span>Teacher</span>
                  <select value={assignTeacherId} onChange={(event) => setAssignTeacherId(event.target.value)}>
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
                  <select value={assignStudentId} onChange={(event) => setAssignStudentId(event.target.value)}>
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
                  <select value={assignCourseId} onChange={(event) => setAssignCourseId(event.target.value)}>
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
                  <select value={planType} onChange={(event) => setPlanType(event.target.value)}>
                    {ASSIGNMENT_MODES.map((mode) => (
                      <option key={mode}>{mode}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    createAssignment.isPending ||
                    !assignTeacherId ||
                    !assignStudentId ||
                    !assignCourseId
                  }
                >
                  {createAssignment.isPending ? 'Creating...' : 'Create Assignment'}
                </button>
              </form>
            </Panel>
          </>
        )}
      </QueryFeedback>
    </Page>
  );
}
