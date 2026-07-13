import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api';
import { HomeworkList } from '../components/lists/HomeworkList';
import { Page } from '../components/ui/Page';
import { QueryFeedback } from '../components/ui/QueryFeedback';

export function HomeworkPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const homework = useQuery({
    queryKey: ['homework', status],
    queryFn: () => api.homework({ status }),
    retry: false,
  });

  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('Practice vocabulary');
  const dueDate = new Date().toISOString().slice(0, 10);
  const studentId = 'student-1';
  const teacherId = 'teacher-1';

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.createHomework(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      setShowForm(false);
    },
  });

  return (
    <Page title="Homework" subtitle="Pending and completed assignments with score and feedback.">
      <div className="toolbar">
        <button
          className={status === 'pending' ? 'active' : ''}
          type="button"
          onClick={() => setStatus('pending')}
        >
          Pending
        </button>
        <button
          className={status === 'completed' ? 'active' : ''}
          type="button"
          onClick={() => setStatus('completed')}
        >
          Completed
        </button>
        <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Homework'}
        </button>
      </div>

      {showForm && (
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate({ homework: text, studentId, teacherId, dueDate });
          }}
        >
          <label className="form-field form-field-wide">
            <span>Description</span>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Homework description"
              required
            />
          </label>
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending ? 'Saving...' : 'Save Homework'}
          </button>
        </form>
      )}

      <QueryFeedback
        isLoading={homework.isLoading}
        isError={homework.isError}
        error={homework.error}
        isEmpty={(homework.data?.length ?? 0) === 0}
        emptyMessage={`No ${status} homework found.`}
      >
        <HomeworkList rows={homework.data ?? []} />
      </QueryFeedback>
    </Page>
  );
}
