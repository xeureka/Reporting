import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api';
import { CalendarView } from '../components/lists/CalendarView';
import { SessionList } from '../components/lists/SessionList';
import { Page } from '../components/ui/Page';
import { QueryFeedback } from '../components/ui/QueryFeedback';
import { ATTENDANCE_OPTIONS, SESSION_VIEWS } from '../lib/constants';

const VIEW_LABELS: Record<(typeof SESSION_VIEWS)[number], string> = {
  today: 'Today',
  'this-week': 'This Week',
  calendar: 'Calendar',
};

export function SessionsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<(typeof SESSION_VIEWS)[number]>('today');
  const sessions = useQuery({
    queryKey: ['sessions', view],
    queryFn: () => api.sessions({ view }),
    retry: false,
  });

  const [showForm, setShowForm] = useState(false);
  const [fields, setFields] = useState({
    sessionName: 'New Session',
    sessionDate: new Date().toISOString().slice(0, 10),
    teacherId: 'teacher-1',
    studentId: 'student-1',
    assignmentId: 'assignment-1',
    lessonNumber: 1,
    lessonTitle: 'Lesson',
    attendance: 'Present',
    durationMinutes: 60,
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.createSession(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setShowForm(false);
    },
  });

  return (
    <Page title="Class Sessions" subtitle="One completed lesson per record.">
      <div className="toolbar">
        {SESSION_VIEWS.map((option) => (
          <button
            className={view === option ? 'active' : ''}
            key={option}
            type="button"
            onClick={() => setView(option)}
          >
            {VIEW_LABELS[option]}
          </button>
        ))}
        <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Session'}
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
            <span>Session name</span>
            <input
              value={fields.sessionName}
              onChange={(event) => setFields({ ...fields, sessionName: event.target.value })}
              placeholder="Session name"
              required
            />
          </label>
          <label className="form-field">
            <span>Lesson title</span>
            <input
              value={fields.lessonTitle}
              onChange={(event) => setFields({ ...fields, lessonTitle: event.target.value })}
              placeholder="Lesson title"
              required
            />
          </label>
          <label className="form-field">
            <span>Date</span>
            <input
              value={fields.sessionDate}
              onChange={(event) => setFields({ ...fields, sessionDate: event.target.value })}
              type="date"
              required
            />
          </label>
          <label className="form-field">
            <span>Attendance</span>
            <select
              value={fields.attendance}
              onChange={(event) => setFields({ ...fields, attendance: event.target.value })}
            >
              {ATTENDANCE_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending ? 'Saving...' : 'Save Session'}
          </button>
        </form>
      )}

      <QueryFeedback
        isLoading={sessions.isLoading}
        isError={sessions.isError}
        error={sessions.error}
        isEmpty={view !== 'calendar' && (sessions.data?.length ?? 0) === 0}
        emptyMessage="No sessions found for this view."
      >
        {view === 'calendar' ? (
          <CalendarView rows={sessions.data ?? []} />
        ) : (
          <SessionList rows={sessions.data ?? []} />
        )}
      </QueryFeedback>
    </Page>
  );
}
