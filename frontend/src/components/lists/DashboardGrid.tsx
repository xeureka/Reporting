import type { DashboardData, TeacherPerformance } from '../../api';
import { MetricCard } from '../ui/MetricCard';
import { Panel } from '../ui/Panel';
import { Table } from '../ui/Table';
import { AssignmentList } from './AssignmentList';
import { ProgressList } from './ProgressList';
import { SessionList } from './SessionList';

export function DashboardGrid({ data }: { data: DashboardData }) {
  return (
    <>
      <div className="metrics-grid">
        <MetricCard
          label="Today's Classes"
          value={data.todayClasses.length}
          hint="Active filtered class views"
        />
        <MetricCard
          label="Attendance Today"
          value={data.todayAttendance.length}
          hint="Session reports submitted"
        />
        <MetricCard
          label="Pending Homework"
          value={data.homeworkPending.length}
          hint="Open homework records"
        />
        <MetricCard
          label="Low Attendance"
          value={data.reports.studentsWithLowAttendance.length}
          hint="Below 75%"
        />
      </div>
      <div className="dashboard-grid">
        <Panel title="Today's Classes">
          <AssignmentList rows={data.todayClasses} emptyMessage="No classes scheduled today." />
        </Panel>
        <Panel title="Recent Lesson Reports">
          <SessionList rows={data.recentLessonReports} emptyMessage="No recent lesson reports." />
        </Panel>
        <Panel title="Teacher Performance">
          <Table
            rows={data.teacherPerformance.map(
              (row): TeacherPerformance & { id: string } => ({ ...row, id: row.teacherId }),
            )}
            emptyMessage="No teacher performance data yet."
            columns={[
              { label: 'Teacher', render: (row) => row.teacherName },
              { label: 'Completed', render: (row) => row.classesCompleted },
              { label: 'Attendance', render: (row) => `${row.studentAttendancePercentage}%` },
              { label: 'Homework', render: (row) => `${row.homeworkCompletionPercentage}%` },
            ]}
          />
        </Panel>
        <Panel title="Student Progress">
          <ProgressList rows={data.studentProgress} emptyMessage="No student progress records." />
        </Panel>
      </div>
    </>
  );
}
